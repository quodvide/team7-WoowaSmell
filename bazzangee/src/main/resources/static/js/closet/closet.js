import { ClosetReviewScroll } from "/js/review/closetReviewScroll.js";
import { ClosetWebSocket } from "/js/closet/closetWebSocket.js";
import {fetchManager} from "/js/util/utils.js";
import {Chartjs} from "/js/chartjs/chartjs.js";

const chartjs = new Chartjs();
const closetWebSocket = new ClosetWebSocket();
const closetReviewScroll = new ClosetReviewScroll({
    foodCategoryId : 0,
    chartobj : chartjs
});

function $_(selector) {
    return document.querySelector(selector);
}

function onSuccessImageUpload(result) {
    result.json().then(result => {
        const review_li = $_('.add-food-image').closest('li');
        review_li.querySelector(".review_upload_image").src = result.url;
        review_li.querySelector('.btn-remove-image').classList.toggle('invisible', false);
        review_li.querySelector('.add-food-image').classList.toggle('add-food-image', false);
    })
}

function onFailLoad(result) {
    alert(result.message);
    document.querySelectorAll('.orderfood-li').forEach( (element) => {
        element.classList.toggle('submitted-li', false);
        if(element.querySelector('.card') != null) {
            element.querySelector('.card').classList.toggle('add-food-image', false);
            element.querySelector(".btn-primary").value = "";
        }
    });
}

function imageUploadHandler(evt) {
    const card = evt.target.closest(".card");
    card.classList.toggle('add-food-image', true);
    let formData = new FormData();
    formData.append('data', card.querySelector(".btn-primary").files[0]);
    fetchManager({
        url: '/api/reviews/upload',
        method: 'POST',
        body: formData,
        callback: onSuccessImageUpload,
        errCallback: onFailLoad
    });
}

function imageDeleteHandler(evt) {
    const review_li = evt.target.closest("li");
    review_li.querySelector('.review_upload_image').src = '';
    review_li.querySelector('.btn-remove-image').classList.toggle('invisible', true);
    review_li.querySelector('.btn-primary').value = '';
}

function onSuccessWrite(response) {
    response.json().then(reviewDto => {
        let reviewDtoHTML = HtmlGenerator.getCreateReviewHTML(reviewDto);
        let reviewBox = $_(".submitted-li");
        reviewBox.innerHTML = '';
        reviewBox.innerHTML = reviewDtoHTML;
        reviewBox.classList.toggle('submitted-li', false);
        chartjs.addChartListener();
        $(".rate").rate();
    })
}

function reviewSubmitHandler(evt) {
    const orderFood = evt.target.closest('li');
    orderFood.classList.toggle('submitted-li', true);
    const card = evt.target.closest(".card");
    let formData = new FormData();
    formData.append('orderFoodId', orderFood.getAttribute('data-id'));
    formData.append('contents', card.querySelector('.card-text').value);
    formData.append("starPoint", card.querySelector('.rate').getAttribute('data-rate-value'));
    if(card.querySelector(".btn-primary").files.length != 0) {
        formData.append('image', card.querySelector(".btn-primary").files[0]);
    }

    fetchManager({
        url: '/api/reviews',
        method: 'POST',
        body: formData,
        callback: onSuccessWrite,
        errCallback: onFailLoad
    });
}

function reviewWriteHandler(evt) {
    document.querySelectorAll('.card').forEach( (element) => {
        element.classList.toggle('invisible', true);
        element.parentElement.querySelector(".review-create-btn").classList.toggle('invisible', false);
    });

    const card = evt.target.closest('li').querySelector('.card');
    card.classList.toggle('invisible', false);
    card.classList.toggle('card-selected', true);
    evt.target.closest(".review-create-btn").classList.toggle('invisible', true);
    $(".rate").rate();

    card.querySelector('.btn-primary').addEventListener("change", imageUploadHandler);
    evt.target.closest('li').querySelector('.btn-remove-image').addEventListener("click", imageDeleteHandler);
    card.querySelector('.btn-review-submit').addEventListener("click", reviewSubmitHandler);

}

function onSuccessUpdateForm(result) {
    result.json().then(result => {
        document.querySelectorAll("li").forEach(function (li) {
            if(li.getAttribute("data-id") == result.id) {
                li.innerHTML = "";
                li.innerHTML = HtmlGenerator.getReviewUpdateFormHTML(result);
                $('.rate').rate();
            }
        })
    });
}

function onFailUpdateForm(result) {
    alert(result.message);
}

function reviewUpdateFormHandler(evt) {
    const orderFoodId = evt.target.closest("li").getAttribute("data-id");
    fetchManager({
        url: '/api/reviews/' + orderFoodId,
        method: 'GET',
        callback: onSuccessUpdateForm,
        errCallback: onFailUpdateForm
    });
}

function onSuccessDelete(result) {
    result.json().then(result => {
        document.querySelectorAll("li").forEach(function (li) {
            if(li.getAttribute("data-id") == result.id) {
                li.innerHTML = "";
                li.innerHTML = HtmlGenerator.getDeleteReviewHTML(result);
            }
        })
    });
}

function onFailDelete(result) {
    alert(result.message);
}

function reviewDeleteHandler(evt) {
    if(!confirm("정말로 삭제하시겠습니까?")) {
        evt.target.blur();
        return;
    }
    const orderFoodId = evt.target.closest("li").getAttribute("data-id");
    fetchManager({
        url: '/api/reviews/' + orderFoodId,
        method: 'DELETE',
        callback: onSuccessDelete,
        errCallback: onFailDelete
    });
}

function onSuccessUpdateCancel(result) {
    result.json().then(result => {
        document.querySelectorAll("li").forEach(function (li) {
            if(li.getAttribute("data-id") == result.id) {
                li.innerHTML = "";
                li.innerHTML = HtmlGenerator.getOrderFoodHTML(result);
                $('.rate').rate();
            }
        })
    });
}
function onFailUpdateCancel(result) {
    alert(result.message);
}

function reviewUpdateCancelHandler(evt) {
    const orderFoodId = evt.target.closest("li").getAttribute("data-id");
    fetchManager({
        url: '/api/reviews/' + orderFoodId,
        method: 'GET',
        callback: onSuccessUpdateCancel,
        errCallback: onFailUpdateCancel
    });
}

function onSuccessImageUpdateUpload(result) {
    const card = $_('.add-update-image');
    result.json().then(result => {
        card.querySelector("#update-image-area").src = result.url;
        card.querySelector('.exist-image-url').value = result.url;
    });
    card.classList.toggle('add-update-image', false);
}


function imageUpdateUploadHandler(evt) {
    const card = evt.target.closest("li");
    let formData = new FormData();
    card.classList.toggle('add-update-image', true);
    formData.append('data', card.querySelector(".btn-image-update-upload").files[0]);
    fetchManager({
        url: '/api/reviews/upload',
        method: 'POST',
        body: formData,
        callback: onSuccessImageUpdateUpload,
        errCallback: onFailLoad
    });
}

function onSuccessUpdate(result) {
    result.json().then(result => {
        document.querySelectorAll("li").forEach(function (li) {
            if(li.getAttribute("data-id") == result.id) {
                li.innerHTML = "";
                li.innerHTML = HtmlGenerator.getOrderFoodHTML(result);
                $('.rate').rate();
                chartjs.addChartListener();
            }
        })
    });
}

function onFailUpdate(result) {
    alert(result.message);
}

function reviewUpdateHandler(evt) {
    const target = evt.target.closest("li");
    const orderFoodId = target.getAttribute("data-id");

    fetchManager({
        url: '/api/reviews/update',
        method: 'POST',
        headers: { 'content-type': 'application/json'},
        body: JSON.stringify({
            "orderFoodId": orderFoodId,
            "contents": target.querySelector('.card-text').value,
            "starPoint": target.querySelector('.rate').getAttribute('data-rate-value'),
            "savedImageUrl": target.querySelector(".exist-image-url").value
        }),
        callback: onSuccessUpdate,
        errCallback: onFailUpdate
    });
}

function reviewWriteCancelHandler(evt) {
    const card = evt.target.closest('li').querySelector('.card');
    card.classList.toggle('invisible', true);
    card.parentElement.querySelector(".review-create-btn").classList.toggle("invisible", false);

    card.closest("li").querySelector(".review_upload_image").src = "";
    card.querySelector('.btn-danger').classList.toggle('invisible', false);
    card.classList.toggle('add-food-image', false);
}

document.addEventListener("DOMContentLoaded", function() {
    // const reviewScroll = new ReviewScroll();
    document.querySelector('.cbp_tmtimeline').addEventListener("click", (evt) => {
        // 리뷰 작성 버튼
        if(evt.target.classList.contains('orderfood-review-write') || evt.target.classList.contains('review-create-btn-image')) {
            reviewWriteHandler(evt);
        }
        // 리뷰작성 취소 버튼
        if(evt.target.classList.contains('btn-review-submit-cancel')) {
            reviewWriteCancelHandler(evt);
        }
        // 수정폼 버튼
        if(evt.target.classList.contains('btn-review-update-form')) {
            reviewUpdateFormHandler(evt);
        }
        //수정 취소 버튼
        if(evt.target.classList.contains('btn-review-update-cancel')) {
            reviewUpdateCancelHandler(evt);
        }
        // 수정 버튼
        if(evt.target.classList.contains('btn-review-update')) {
            reviewUpdateHandler(evt);
        }
        // 삭제 버튼
        if(evt.target.classList.contains('btn-review-delete')) {
            reviewDeleteHandler(evt);
        }
        // 업데이트폼에서 이미지 첨부 버튼
        if(evt.target.classList.contains('btn-image-update-upload')) {
            evt.target.closest('li').querySelector('.btn-image-update-upload').addEventListener("change", imageUpdateUploadHandler);
        }

        if(evt.target.classList.contains('good-btn') || evt.target.parentElement.classList.contains("good-btn")) {
            closetWebSocket.onclickGoodButton(evt);
        }
    });
});


