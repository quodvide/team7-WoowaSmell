import {$, fetchManager} from "/js/util/utils.js";

export class JoinValidator{
    constructor({hideModalFunc, showModalFunc}) {
        this.hideModalFunc = hideModalFunc;
        this.showModalFunc = showModalFunc;
        document.addEventListener("DOMContentLoaded", this.onLoadDocument.bind(this));
    }

    onLoadDocument() {
        $("#join-form-send-btn").addEventListener("click", this.onClickSendButton.bind(this));
    }

    onClickSendButton({target: {form: form}}) {
        if(!this.checkValidate()) return;

        fetchManager({
            url: '/api/users',
            method: 'POST',
            headers: { 'content-type': 'application/json'},
            body: JSON.stringify({
                userId: form.email.value,
                password: form.joinpassword.value,
                rePassword: form.repassword.value,
                name: form.name.value,
                phoneNumber: form.phone.value,
                birth: form.birth.value
            }),
            callback: this.onSuccessJoin.bind(this),
            errCallback: this.onFailJoin.bind(this)
        });
    }

    checkValidate() {
        const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
        const nameRegex = /^[가-힝]{2,}$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/;
        const phoneRegex = /^\d{3}\d{3,4}\d{4}$/;
        const birthRegex = /^\d{4}-\d{2}-\d{2}$/;

        if(!emailRegex.test($("#email").value.trim())) {
            $("#join-validation-span").innerText = "이메일 형식이 올바르지 않습니다.";
            return false;
        }

        if(!passwordRegex.test($("#joinpassword").value.trim()) || !passwordRegex.test($("#repassword").value.trim())) {
            $("#join-validation-span").innerText = "비밀번호는 8-16자리 영문,숫자,특수문자로 조합으로 설정해주세요.";
            return false;
        }

        if($("#joinpassword").value.trim() !== $("#repassword").value.trim()) {
            $("#join-validation-span").innerText = "비밀번호가 일치하지 않습니다.";
            return false;
        }

        if(!nameRegex.test($("#name").value.trim())) {
            $("#join-validation-span").innerText = "이름 형식이 올바르지 않습니다.";
            return false;
        }

        if(!phoneRegex.test($("#phone").value.trim())) {
            $("#join-validation-span").innerText = "핸드폰 형식이 올바르지 않습니다.";
            return false;
        }

        if(!birthRegex.test($("#birth").value.trim())) {
            $("#join-validation-span").innerText = "생년월일 형식이 올바르지 않습니다.";
            return false;
        }
        $("#join-validation-span").innerText = null;
        return true;
    }

    onSuccessJoin(result) {
        this.hideModalFunc("joinModal");
        this.showModalFunc("joinSuccessModal");
    }

    onFailJoin() {

    }

}