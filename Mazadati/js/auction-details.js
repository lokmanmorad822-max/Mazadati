let currentAuction = null;
let currentUser = null;
let modalsLoaded = false;

$(document).ready(function () {

    currentUser = JSON.parse(
        localStorage.getItem('mazadatiCurrentUser')
    );

    loadModalComponents(
        [
            'bid-modal.html',
            'login-modal.html',
            'message-modal.html'
        ],
        function () {

            modalsLoaded = true;

            console.log(
                'تم تحميل نوافذ المزاد بواسطة AJAX بنجاح.'
            );

        }
    );

    loadAuctionDetails();

    $(document).on(
        'click',
        '#favoriteButton',
        toggleFavorite
    );

    $(document).on(
        'click',
        '#bidButton',
        openBidModal
    );

    $(document).on(
        'click',
        '#submitBidButton',
        submitBid
    );
});


function loadAuctionDetails() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const auctionId =
        params.get('id');

    if (!auctionId) {

        showError(
            'لم يتم تحديد المزاد المطلوب.'
        );

        return;
    }

    showLoading();

    const userAuctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];

    const localAuction =
        userAuctions.find(
            function (auction) {

                return (
                    String(auction.id) ===
                    String(auctionId)
                );

            }
        );

    if (localAuction) {

        currentAuction =
            prepareAuction(
                localAuction
            );

        renderAuction();

        return;
    }


    $.ajax({

        url: 'data/auctions.json',

        method: 'GET',

        dataType: 'json',

        success: function (data) {

            let auctions = data;

            if (!Array.isArray(auctions)) {

                if (
                    Array.isArray(
                        data.auctions
                    )
                ) {

                    auctions =
                        data.auctions;

                } else {

                    auctions = [];

                }
            }


            const auction =
                auctions.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(auctionId)
                        );

                    }
                );


            if (!auction) {

                showError(
                    'المزاد المطلوب غير موجود.'
                );

                return;
            }


            currentAuction =
                prepareAuction(
                    auction
                );

            renderAuction();

        },

        error: function (
            xhr,
            status,
            error
        ) {

            console.error(
                'Auction AJAX Error:',
                error
            );

            showError(
                'حدث خطأ أثناء تحميل بيانات المزاد.<br>' +
                'تأكد من تشغيل المشروع باستخدام Live Server.'
            );

        }

    });
}


function prepareAuction(auction) {

    const updates =
        JSON.parse(
            localStorage.getItem(
                'mazadatiAuctionUpdates'
            )
        ) || {};

    const auctionId =
        String(auction.id);

    const update =
        updates[auctionId];

    const preparedAuction = {
        ...auction
    };


    if (update) {

        if (
            update.currentPrice !==
            undefined
        ) {

            preparedAuction.currentPrice =
                Number(
                    update.currentPrice
                );

        }


        if (
            update.bids !==
            undefined
        ) {

            preparedAuction.bids =
                Number(
                    update.bids
                );

        }

    }


    if (
        preparedAuction.currentPrice ===
        undefined ||
        preparedAuction.currentPrice ===
        null
    ) {

        preparedAuction.currentPrice =
            Number(
                preparedAuction.price || 0
            );

    }


    if (
        preparedAuction.bids ===
        undefined ||
        preparedAuction.bids ===
        null
    ) {

        preparedAuction.bids = 0;

    }


    return preparedAuction;
}


function renderAuction() {

    if (!currentAuction) {

        showError(
            'تعذر تحميل بيانات المزاد.'
        );

        return;
    }


    const auction =
        currentAuction;


    const title =
        auction.title ||
        'مزاد بدون عنوان';


    const category =
        auction.category ||
        'متنوع';


    const description =
        auction.description ||
        'لا يوجد وصف لهذا المزاد.';


    const image =
        auction.image ||
        'images/auction-placeholder.jpg';


    const price =
        Number(
            auction.currentPrice || 0
        );


    const bids =
        Number(
            auction.bids || 0
        );


    const status =
        auction.status ||
        'نشط';


    const ownerName =
        auction.ownerName ||
        'مستخدم';


    const duration =
        auction.duration ||
        'غير محدد';


    $('#auctionLoading').hide();

    $('#auctionContent').fadeIn(300);


    $('#auctionImage')
        .attr(
            'src',
            image
        )
        .attr(
            'alt',
            title
        );


    $('#auctionTitle')
        .text(title);


    $('#auctionCategory')
        .text(category);


    $('#auctionDescription')
        .text(description);


    $('#auctionPrice')
        .text(
            formatPrice(price)
        );


    $('#auctionBids')
        .text(bids);


    $('#auctionStatus')
        .text(status);


    $('#auctionOwner')
        .text(ownerName);


    $('#auctionDuration')
        .text(duration);


    $('#auctionId')
        .text(
            auction.id
        );


    if (auction.createdAt) {

        $('#auctionCreatedAt')
            .text(
                formatDate(
                    auction.createdAt
                )
            );

    } else {

        $('#auctionCreatedAt')
            .text('غير محدد');

    }


    updateFavoriteButton();

    setupBidButton();


    if (
        auction.status ===
        'منتهي'
    ) {

        $('#bidButton')
            .prop(
                'disabled',
                true
            )
            .html(`
                <i class="fa-solid fa-lock"></i>
                المزاد منتهي
            `);

    }

}


function setupBidButton() {

    const button =
        $('#bidButton');


    if (button.length === 0) {

        return;
    }


    const ownerId =
        currentAuction.ownerId;


    if (
        currentUser &&
        ownerId &&
        String(currentUser.id) ===
        String(ownerId)
    ) {

        button
            .prop(
                'disabled',
                true
            )
            .html(`
                <i class="fa-solid fa-user-shield"></i>
                لا يمكنك المزايدة على مزادك
            `);

        return;
    }


    if (
        currentAuction.status ===
        'منتهي'
    ) {

        button
            .prop(
                'disabled',
                true
            )
            .html(`
                <i class="fa-solid fa-lock"></i>
                المزاد منتهي
            `);

        return;
    }


    button
        .prop(
            'disabled',
            false
        )
        .html(`
            <i class="fa-solid fa-gavel"></i>
            أضف مزايدة
        `);

}


function openBidModal() {

    if (!currentUser) {

        showLoginRequired();

        return;
    }


    if (!currentAuction) {

        return;
    }


    const ownerId =
        currentAuction.ownerId;


    if (
        ownerId &&
        String(ownerId) ===
        String(currentUser.id)
    ) {

        showMessage(
            'غير مسموح',
            'لا يمكنك المزايدة على مزادك الخاص.',
            'warning'
        );

        return;
    }


    if (
        currentAuction.status ===
        'منتهي'
    ) {

        showMessage(
            'المزاد منتهي',
            'لا يمكن إضافة مزايدة جديدة.',
            'warning'
        );

        return;
    }


    if (!modalsLoaded) {

        showMessage(
            'يرجى الانتظار',
            'جاري تحميل نافذة المزايدة، حاول مرة أخرى بعد لحظات.',
            'info'
        );

        return;
    }


    const currentPrice =
        Number(
            currentAuction.currentPrice || 0
        );


    const minimumBid =
        currentPrice + 1000;


    $('#currentBidValue')
        .text(
            formatPrice(
                currentPrice
            )
        );


    $('#minimumBidValue')
        .text(
            formatPrice(
                minimumBid
            )
        );


    $('#bidAmount')
        .val('')
        .attr(
            'min',
            minimumBid
        );


    $('#bidError')
        .addClass('d-none')
        .text('');


    showAjaxModal(
        'bidModal'
    );

}


function submitBid() {

    if (!currentUser) {

        showLoginRequired();

        return;
    }


    if (!currentAuction) {

        return;
    }


    const bidAmount =
        Number(
            $('#bidAmount').val()
        );


    const currentPrice =
        Number(
            currentAuction.currentPrice || 0
        );


    const minimumBid =
        currentPrice + 1000;


    if (
        !bidAmount ||
        bidAmount <= 0
    ) {

        showBidError(
            'يرجى إدخال قيمة المزايدة.'
        );

        return;
    }


    if (
        bidAmount <
        minimumBid
    ) {

        showBidError(
            'يجب أن تكون المزايدة أكبر من السعر الحالي بمقدار 1000 ريال على الأقل.'
        );

        return;
    }


    const bid = {

        id:
            Date.now(),

        auctionId:
            currentAuction.id,

        auctionTitle:
            currentAuction.title,

        userId:
            currentUser.id,

        userName:
            currentUser.name,

        amount:
            bidAmount,

        createdAt:
            new Date().toISOString()

    };


    saveBid(bid);


    updateAuctionAfterBid(
        bidAmount
    );


    hideAjaxModal(
        'bidModal'
    );


    showMessage(
        'تمت المزايدة بنجاح',
        `تم تسجيل مزايدتك بقيمة ${formatPrice(bidAmount)} ريال.`,
        'success'
    );


    setTimeout(
        function () {

            location.reload();

        },
        1200
    );

}


function saveBid(bid) {

    const bids =
        JSON.parse(
            localStorage.getItem(
                'mazadatiBids'
            )
        ) || [];


    bids.push(bid);


    localStorage.setItem(
        'mazadatiBids',
        JSON.stringify(bids)
    );

}


function updateAuctionAfterBid(
    newPrice
) {

    const auctionId =
        String(
            currentAuction.id
        );


    const userAuctions =
        JSON.parse(
            localStorage.getItem(
                'mazadatiUserAuctions'
            )
        ) || [];


    const userAuctionIndex =
        userAuctions.findIndex(
            function (auction) {

                return (
                    String(auction.id) ===
                    auctionId
                );

            }
        );


    if (
        userAuctionIndex !== -1
    ) {

        userAuctions[
            userAuctionIndex
        ].currentPrice =
            newPrice;


        userAuctions[
            userAuctionIndex
        ].price =
            newPrice;


        userAuctions[
            userAuctionIndex
        ].bids =
            Number(
                userAuctions[
                    userAuctionIndex
                ].bids || 0
            ) + 1;


        localStorage.setItem(
            'mazadatiUserAuctions',
            JSON.stringify(
                userAuctions
            )
        );

    }


    const updates =
        JSON.parse(
            localStorage.getItem(
                'mazadatiAuctionUpdates'
            )
        ) || {};


    const oldUpdate =
        updates[auctionId] || {};


    updates[auctionId] = {

        ...oldUpdate,

        currentPrice:
            newPrice,

        bids:
            Number(
                oldUpdate.bids ||
                currentAuction.bids ||
                0
            ) + 1

    };


    localStorage.setItem(
        'mazadatiAuctionUpdates',
        JSON.stringify(
            updates
        )
    );

}


function toggleFavorite() {

    if (!currentUser) {

        showLoginRequired();

        return;
    }


    if (!currentAuction) {

        return;
    }


    let favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    const auctionId =
        String(
            currentAuction.id
        );


    const index =
        favorites.findIndex(
            function (item) {

                return (
                    String(item.auctionId) ===
                    auctionId &&
                    String(item.userId) ===
                    String(currentUser.id)
                );

            }
        );


    if (index !== -1) {

        favorites.splice(
            index,
            1
        );


        showMessage(
            'تمت الإزالة',
            'تمت إزالة المزاد من المفضلة.',
            'info'
        );

    } else {

        favorites.push({

            auctionId:
                currentAuction.id,

            userId:
                currentUser.id,

            createdAt:
                new Date().toISOString()

        });


        showMessage(
            'تمت الإضافة',
            'تمت إضافة المزاد إلى المفضلة.',
            'success'
        );

    }


    localStorage.setItem(
        'mazadatiFavorites',
        JSON.stringify(
            favorites
        )
    );


    updateFavoriteButton();

}


function updateFavoriteButton() {

    const button =
        $('#favoriteButton');


    if (button.length === 0) {

        return;
    }


    if (!currentUser) {

        button.removeClass(
            'active'
        );


        button.html(`
            <i class="fa-regular fa-heart"></i>
            المفضلة
        `);

        return;
    }


    const favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    const auctionId =
        String(
            currentAuction.id
        );


    const isFavorite =
        favorites.some(
            function (item) {

                return (
                    String(item.auctionId) ===
                    auctionId &&
                    String(item.userId) ===
                    String(currentUser.id)
                );

            }
        );


    if (isFavorite) {

        button.addClass(
            'active'
        );


        button.html(`
            <i class="fa-solid fa-heart"></i>
            في المفضلة
        `);

    } else {

        button.removeClass(
            'active'
        );


        button.html(`
            <i class="fa-regular fa-heart"></i>
            أضف للمفضلة
        `);

    }

}


function showLoginRequired() {

    if (!modalsLoaded) {

        window.location.href =
            'login.html';

        return;
    }


    showAjaxModal(
        'loginRequiredModal'
    );

}


function showBidError(message) {

    $('#bidError')
        .removeClass(
            'd-none'
        )
        .text(message);

}


function showMessage(
    title,
    message,
    type
) {

    const modal =
        $('#messageModal');


    if (
        modal.length === 0 ||
        !modalsLoaded
    ) {

        alert(
            title +
            '\n\n' +
            message
        );

        return;
    }


    const icon =
        $('#messageModalIcon');


    const titleElement =
        $('#messageModalTitle');


    const body =
        $('#messageModalBody');


    titleElement.text(
        title
    );


    body.text(
        message
    );


    icon.removeClass(
        'text-success text-danger text-warning text-info'
    );


    if (type === 'success') {

        icon
            .addClass(
                'text-success'
            )
            .html(`
                <i class="fa-solid fa-circle-check"></i>
            `);

    } else if (
        type === 'warning'
    ) {

        icon
            .addClass(
                'text-warning'
            )
            .html(`
                <i class="fa-solid fa-triangle-exclamation"></i>
            `);

    } else if (
        type === 'info'
    ) {

        icon
            .addClass(
                'text-info'
            )
            .html(`
                <i class="fa-solid fa-circle-info"></i>
            `);

    } else {

        icon
            .addClass(
                'text-danger'
            )
            .html(`
                <i class="fa-solid fa-circle-xmark"></i>
            `);

    }


    showAjaxModal(
        'messageModal'
    );

}


function showLoading() {

    $('#auctionLoading')
        .show();


    $('#auctionContent')
        .hide();


    $('#auctionError')
        .hide();

}


function showError(message) {

    $('#auctionLoading')
        .hide();


    $('#auctionContent')
        .hide();


    $('#auctionError')
        .html(`

            <div class="error-box">

                <div class="error-icon">

                    <i class="fa-solid fa-circle-exclamation"></i>

                </div>


                <h3>
                    تعذر تحميل المزاد
                </h3>


                <p>
                    ${message}
                </p>


                <button
                    type="button"
                    class="btn btn-gold"
                    onclick="loadAuctionDetails()"
                >

                    <i class="fa-solid fa-rotate"></i>

                    إعادة المحاولة

                </button>


                <a
                    href="auctions.html"
                    class="btn btn-outline-primary"
                >

                    <i class="fa-solid fa-arrow-right"></i>

                    العودة للمزادات

                </a>

            </div>

        `)
        .show();

}


function formatPrice(price) {

    return Number(
        price || 0
    ).toLocaleString(
        'ar-YE'
    );

}


function formatDate(date) {

    if (!date) {

        return 'غير محدد';

    }


    const parsedDate =
        new Date(date);


    if (
        isNaN(
            parsedDate.getTime()
        )
    ) {

        return 'غير محدد';

    }


    return parsedDate.toLocaleDateString(
        'ar-YE',
        {
            year:
                'numeric',

            month:
                'long',

            day:
                'numeric'
        }
    );

}