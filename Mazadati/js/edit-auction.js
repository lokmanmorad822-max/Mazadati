let currentUser = null;

let currentAuction = null;

let auctionId = null;

let newImageData = null;


$(document).ready(function () {

    loadCurrentUser();

    getAuctionId();

    loadAuction();

    initEvents();

});



/* =====================================================
   CURRENT USER
===================================================== */

function loadCurrentUser() {

    currentUser =
        JSON.parse(
            localStorage.getItem(
                'mazadatiCurrentUser'
            )
        );


    if (!currentUser) {

        window.location.href =
            'login.html';

    }

}



/* =====================================================
   GET ID
===================================================== */

function getAuctionId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    auctionId =
        params.get('id');


    if (!auctionId) {

        showError(
            'لم يتم تحديد المزاد المطلوب.'
        );

    }

}



/* =====================================================
   LOAD AUCTION
===================================================== */

function loadAuction() {

    if (!auctionId || !currentUser) {
        return;
    }


    let auctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];


    currentAuction =
        auctions.find(
            function (auction) {

                return String(
                    auction.id
                ) === String(
                    auctionId
                );

            }
        );


    if (!currentAuction) {

        showError(
            'المزاد غير موجود أو لا يمكنك تعديله.'
        );

        return;

    }


    /*
     * التأكد أن المزاد ملك المستخدم
     */

    if (
        String(currentAuction.ownerId) !==
        String(currentUser.id)
    ) {

        showError(
            'لا يمكنك تعديل هذا المزاد لأنه ليس تابعًا لحسابك.'
        );

        return;

    }


    fillForm();


    $('#editAuctionLoading')
        .hide();


    $('#editAuctionWrapper')
        .show();

}



/* =====================================================
   FILL FORM
===================================================== */

function fillForm() {

    $('#editTitle')
        .val(
            currentAuction.title || ''
        );


    $('#editCategory')
        .val(
            currentAuction.category || ''
        );


    $('#editPrice')
        .val(
            currentAuction.price || ''
        );


    $('#editDescription')
        .val(
            currentAuction.description || ''
        );


    $('#editDuration')
        .val(
            currentAuction.duration || ''
        );


    const image =
        currentAuction.image ||
        'images/auction-placeholder.jpg';


    $('#currentAuctionImage')
        .attr(
            'src',
            image
        );

}



/* =====================================================
   EVENTS
===================================================== */

function initEvents() {


    $('#editAuctionForm')
        .on(
            'submit',
            function (event) {

                event.preventDefault();

                updateAuction();

            }
        );



    $('#editImage')
        .on(
            'change',
            handleImage
        );



    $('#goToProfileButton')
        .on(
            'click',
            function () {

                window.location.href =
                    'profile.html';

            }
        );

}



/* =====================================================
   IMAGE
===================================================== */

function handleImage(event) {

    const file =
        event.target.files[0];


    if (!file) {

        newImageData = null;

        $('#newImageWrapper')
            .hide();

        return;

    }


    if (
        !file.type.startsWith(
            'image/'
        )
    ) {

        showFormError(
            'يرجى اختيار ملف صورة صالح.'
        );


        $('#editImage')
            .val('');


        return;

    }


    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

        showFormError(
            'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.'
        );


        $('#editImage')
            .val('');


        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (e) {

            newImageData =
                e.target.result;


            $('#newAuctionImage')
                .attr(
                    'src',
                    newImageData
                );


            $('#newImageWrapper')
                .show();

        };


    reader.readAsDataURL(
        file
    );

}



/* =====================================================
   UPDATE AUCTION
===================================================== */

function updateAuction() {


    const title =
        $('#editTitle')
            .val()
            .trim();


    const category =
        $('#editCategory')
            .val();


    const price =
        Number(
            $('#editPrice')
                .val()
        );


    const description =
        $('#editDescription')
            .val()
            .trim();


    const duration =
        $('#editDuration')
            .val();



    /* ================================================
       VALIDATION
    ================================================= */

    if (!title) {

        showFormError(
            'يرجى إدخال عنوان المزاد.'
        );

        return;

    }


    if (!category) {

        showFormError(
            'يرجى اختيار تصنيف المزاد.'
        );

        return;

    }


    if (
        !price ||
        price <= 0
    ) {

        showFormError(
            'يرجى إدخال سعر ابتدائي صحيح.'
        );

        return;

    }


    if (!description) {

        showFormError(
            'يرجى إدخال وصف المزاد.'
        );

        return;

    }


    if (!duration) {

        showFormError(
            'يرجى اختيار مدة المزاد.'
        );

        return;

    }



    /* ================================================
       GET AUCTIONS
    ================================================= */

    let auctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];



    /* ================================================
       FIND AUCTION
    ================================================= */

    const index =
        auctions.findIndex(
            function (auction) {

                return String(
                    auction.id
                ) === String(
                    auctionId
                );

            }
        );


    if (index === -1) {

        showFormError(
            'تعذر العثور على المزاد.'
        );

        return;

    }



    /* ================================================
       KEEP CURRENT PRICE
    ================================================= */

    const currentPrice =
        Number(
            currentAuction.currentPrice ||
            currentAuction.price ||
            price
        );


    const bids =
        Number(
            currentAuction.bids ||
            0
        );



    /* ================================================
       UPDATE OBJECT
    ================================================= */

    auctions[index] = {

        ...auctions[index],

        title:
            title,

        category:
            category,

        price:
            price,

        description:
            description,

        duration:
            duration,

        currentPrice:
            currentPrice,

        bids:
            bids,

        image:
            newImageData ||
            auctions[index].image,

        updatedAt:
            new Date().toISOString()

    };



    /* ================================================
       SAVE
    ================================================= */

    localStorage.setItem(

        'mazadatiUserAuctions',

        JSON.stringify(auctions)

    );



    /*
     * تحديث المتغير الحالي
     */

    currentAuction =
        auctions[index];



    /*
     * تحديث زر السعر العام
     */

    updateAuctionUpdateData();



    /*
     * إظهار رسالة النجاح
     */

    const modalElement =
        document.getElementById(
            'editSuccessModal'
        );


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}



/* =====================================================
   UPDATE AUCTION UPDATE DATA
===================================================== */

function updateAuctionUpdateData() {

    const updates =
        JSON.parse(
            localStorage.getItem(
                'mazadatiAuctionUpdates'
            )
        ) || {};


    const existing =
        updates[
            String(currentAuction.id)
        ];


    if (existing) {

        existing.currentPrice =
            currentAuction.currentPrice;


        existing.bids =
            currentAuction.bids;


        updates[
            String(currentAuction.id)
        ] =
            existing;


        localStorage.setItem(

            'mazadatiAuctionUpdates',

            JSON.stringify(updates)

        );

    }

}



/* =====================================================
   ERROR
===================================================== */

function showError(message) {

    $('#editAuctionLoading')
        .hide();


    $('#editAuctionWrapper')
        .hide();


    $('#editAuctionError')
        .show()
        .text(message);

}



/* =====================================================
   FORM ERROR
===================================================== */

function showFormError(message) {

    /*
     * استخدام Bootstrap alert مؤقت
     */

    let alert =
        $('#editFormAlert');


    if (!alert.length) {

        $('#editAuctionForm')
            .prepend(`

                <div
                    id="editFormAlert"
                    class="alert alert-danger">

                </div>

            `);


        alert =
            $('#editFormAlert');

    }


    alert
        .text(message)
        .show();


    $('html, body').animate({

        scrollTop:
            alert.offset().top - 120

    }, 300);


    setTimeout(
        function () {

            alert.fadeOut();

        },
        3500
    );

}