$(document).ready(function () {

    checkUserLogin();

    handleImagePreview();

    handleCharacterCount();

    handleFormSubmit();

    handleRemoveImage();

});


function checkUserLogin() {

    const currentUser =
        JSON.parse(
            localStorage.getItem('mazadatiCurrentUser')
        );


    if (!currentUser) {

        alert('يجب تسجيل الدخول أولاً لإضافة مزاد.');

        window.location.href = 'login.html';

    }

}


function handleImagePreview() {

    $('#auctionImage').on('change', function () {

        const file = this.files[0];


        if (!file) {

            clearImagePreview();

            return;

        }


        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];


        if (!allowedTypes.includes(file.type)) {

            showError(
                'نوع الصورة غير مسموح. استخدم JPG أو PNG أو WEBP.'
            );

            this.value = '';

            clearImagePreview();

            return;

        }


        const maxSize =
            5 * 1024 * 1024;


        if (file.size > maxSize) {

            showError(
                'حجم الصورة يجب ألا يتجاوز 5MB.'
            );

            this.value = '';

            clearImagePreview();

            return;

        }


        hideError();


        const reader =
            new FileReader();


        reader.onload = function (event) {

            $('#imagePreview')
                .attr('src', event.target.result);


            $('#imagePreviewContainer')
                .removeClass('d-none');

        };


        reader.readAsDataURL(file);

    });

}


function handleRemoveImage() {

    $('#removeImage').on('click', function () {

        $('#auctionImage').val('');

        clearImagePreview();

    });

}


function clearImagePreview() {

    $('#imagePreview')
        .attr('src', '');


    $('#imagePreviewContainer')
        .addClass('d-none');

}


function handleCharacterCount() {

    $('#auctionDescription').on('input', function () {

        const length =
            $(this).val().length;


        $('#characterCount')
            .text(length + ' / 1000');

    });

}


function handleFormSubmit() {

    $('#addAuctionForm').on('submit', function (event) {

        event.preventDefault();


        hideError();


        const form =
            this;


        if (!form.checkValidity()) {

            event.stopPropagation();

            $(form).addClass('was-validated');

            return;

        }


        const title =
            $('#auctionTitle')
                .val()
                .trim();


        const category =
            $('#auctionCategory')
                .val();


        const price =
            Number(
                $('#auctionPrice')
                    .val()
            );


        const duration =
            $('#auctionDuration')
                .val();


        const description =
            $('#auctionDescription')
                .val()
                .trim();


        const imageFile =
            $('#auctionImage')[0].files[0];


        const terms =
            $('#auctionTerms')
                .is(':checked');


        if (title.length < 3) {

            showError(
                'عنوان المزاد يجب أن يحتوي على 3 أحرف على الأقل.'
            );

            return;

        }


        if (price <= 0) {

            showError(
                'السعر الابتدائي يجب أن يكون أكبر من صفر.'
            );

            return;

        }


        if (description.length < 10) {

            showError(
                'وصف المزاد يجب أن يحتوي على 10 أحرف على الأقل.'
            );

            return;

        }


        if (!imageFile) {

            showError(
                'يرجى اختيار صورة للمزاد.'
            );

            return;

        }


        if (!terms) {

            showError(
                'يجب الموافقة على الشروط والأحكام.'
            );

            return;

        }


        saveAuction(
            title,
            category,
            price,
            duration,
            description,
            imageFile
        );

    });

}


function saveAuction(
    title,
    category,
    price,
    duration,
    description,
    imageFile
) {

    const currentUser =
        JSON.parse(
            localStorage.getItem('mazadatiCurrentUser')
        );


    if (!currentUser) {

        showError(
            'انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.'
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (event) {

        const imageData =
            event.target.result;


        const auction = {

            id: Date.now(),

            title: title,

            category: category,

            price: price,

            currentPrice: price,

            description: description,

            duration: duration,

            image: imageData,

            status: 'نشط',

            bids: 0,

            ownerId: currentUser.id,

            ownerName: currentUser.name,

            createdAt:
                new Date().toISOString()

        };


        let auctions =
            JSON.parse(
                localStorage.getItem('mazadatiUserAuctions')
            ) || [];


        auctions.unshift(auction);


        try {

            localStorage.setItem(
                'mazadatiUserAuctions',
                JSON.stringify(auctions)
            );

        }

        catch (error) {

            showError(
                'تعذر حفظ الصورة. قد تكون مساحة التخزين في المتصفح ممتلئة.'
            );

            return;

        }


        $('#addAuctionForm')
            .trigger('reset');


        $('#addAuctionForm')
            .removeClass('was-validated');


        $('#characterCount')
            .text('0 / 1000');


        clearImagePreview();


        showSuccessModal();

    };


    reader.onerror = function () {

        showError(
            'حدث خطأ أثناء قراءة الصورة.'
        );

    };


    reader.readAsDataURL(imageFile);

}


function showSuccessModal() {

    const modalElement =
        document.getElementById(
            'auctionSuccessModal'
        );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}


function showError(message) {

    $('#auctionError')
        .removeClass('d-none')
        .html(`

            <i class="fa-solid fa-circle-exclamation"></i>

            ${message}

        `);


    $('html, body').animate({

        scrollTop:
            $('#auctionError').offset().top - 120

    }, 400);

}


function hideError() {

    $('#auctionError')
        .addClass('d-none')
        .html('');

}