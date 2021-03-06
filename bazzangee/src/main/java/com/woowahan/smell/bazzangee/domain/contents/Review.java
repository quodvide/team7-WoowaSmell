package com.woowahan.smell.bazzangee.domain.contents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.woowahan.smell.bazzangee.domain.BaseTimeEntity;
import com.woowahan.smell.bazzangee.domain.User;
import com.woowahan.smell.bazzangee.domain.food.FoodCategory;
import com.woowahan.smell.bazzangee.domain.food.OrderFood;
import com.woowahan.smell.bazzangee.dto.request.ReviewRequestDto;
import com.woowahan.smell.bazzangee.dto.response.ReviewResponseDto;
import com.woowahan.smell.bazzangee.exception.NotMatchException;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@ToString
@NoArgsConstructor
@Entity
@Slf4j
@Where(clause = "is_deleted != true")
public class Review extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "user_id"))
    @JsonIgnore
    private User user;

    @Column
    @Lob
    private String contents;

    @Column
    private String imageUrl;
    @Column
    private String originName;
    @Column
    private double starPoint;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Good> goods = new ArrayList<>();
    @OneToOne(fetch = FetchType.EAGER)
    @JsonIgnore
    private OrderFood orderFood;

    @ManyToOne
    @JoinColumn(foreignKey = @ForeignKey(name = "fk_review_food_category"))
    @JsonIgnore
    private FoodCategory foodCategory;
    @Column
    @ColumnDefault("false")
    @JsonIgnore
    private boolean isDeleted;

    public Review(OrderFood orderFood, User loginUser, String contents, double starPoint) {
        if(!orderFood.isMatchedBy(loginUser))
            throw new NotMatchException("타인의 리뷰는 등록할 수 없습니다.");
        this.orderFood = orderFood;
        this.user = loginUser;
        this.contents = contents;
        this.starPoint = starPoint;
    }

    public Review(OrderFood orderFood, User loginUser, String contents, double starPoint, String imageUrl, String originName, FoodCategory foodCategory) {
        if(!orderFood.isMatchedBy(loginUser))
            throw new NotMatchException("타인의 리뷰는 등록할 수 없습니다.");
        this.orderFood = orderFood;
        this.user = loginUser;
        this.contents = contents;
        this.starPoint = starPoint;
        this.imageUrl = imageUrl;
        this.originName = originName;
        this.foodCategory = foodCategory;
    }

    public void delete(User loginUser) {
        if (!loginUser.equals(this.user))
            throw new NotMatchException("타인의 리뷰는 삭제할 수 없습니다.");
        this.isDeleted = true;
    }

    public void update(ReviewRequestDto reviewRequestDto, User loginUser, String imageUrl) {
        if (!loginUser.equals(this.user))
            throw new NotMatchException("타인의 리뷰는 수정할 수 없습니다.");
        this.contents = reviewRequestDto.getContents();
        if (reviewRequestDto.getImage() != null)
            this.imageUrl = reviewRequestDto.getImage().getOriginalFilename();

        this.starPoint = reviewRequestDto.getStarPoint();
        this.imageUrl = imageUrl;
    }

    public ReviewResponseDto toReviewDto () {
        return new ReviewResponseDto(this,
                this.orderFood.getOrderedUser().getName(),
                this.orderFood.getQuantity(),
                this.orderFood.getFood().getName(),
                this.orderFood.getFood().getRestaurant(),
                this.orderFood.getOrderTime(),
                this.goods.size()
        );
    }

    public void removeGood(Good good) {
        this.goods.remove(good);
    }

    public void addGood(Good good) {
        this.goods.add(good);
    }
}

