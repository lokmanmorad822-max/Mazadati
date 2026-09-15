let allAuctions = [];

let filteredAuctions = [];

let currentPage = 1;

const auctionsPerPage = 8;


$(document).ready(function () {

    loadAuctions();

    initFilters();

});


function loadAuctions() {

    $.ajax({

        url: 'data/auctions.json',

        method: 'GET',

        dataType: 'json',

        cache: false,

        success: function (data) {

            const userAuctions =
                JSON.parse(
                    localStorage.getItem(
                        'mazadatiUserAuctions'
                    )
                ) || [];


            let jsonAuctions = [];


            if (Array.isArray(data)) {

                jsonAuctions = data;

            }
            else if (Array.isArray(data.auctions)) {

                jsonAuctions = data.auctions;

            }


            allAuctions = [

                ...userAuctions,

                ...jsonAuctions

            ];


            filteredAuctions =
                [...allAuctions];


            currentPage = 1;

            displayAuctions(
                filteredAuctions
            );

        },

        error: function () {

            const userAuctions =
                JSON.parse(
                    localStorage.getItem(
                        'mazadatiUserAuctions'
                    )
                ) || [];


            if (userAuctions.length > 0) {

                allAuctions =
                    userAuctions;


                filteredAuctions =
                    [...userAuctions];


                currentPage = 1;

                displayAuctions(
                    filteredAuctions
                );

                return;

            }


            $('#auctionsContainer').html(`

                <div class="col-12">

                    <div class="alert alert-danger text-center">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        حدث خطأ أثناء تحميل بيانات المزادات.

                    </div>

                </div>

            `);

        }

    });

}


function displayAuctions(auctions) {

    const container =
        $('#auctionsContainer');


    if (auctions.length === 0) {

        container.html(`

            <div class="col-12">

                <div class="empty-auctions">

                    <i class="fa-solid fa-gavel"></i>

                    <h3>
                        لا توجد مزادات
                    </h3>

                    <p>
                        لم يتم العثور على مزادات مطابقة للبحث.
                    </p>

                    <a
                        href="add-auction.html"
                        class="btn btn-gold">

                        <i class="fa-solid fa-plus"></i>

                        أضف أول مزاد

                    </a>

                </div>

            </div>

        `);


        $('#pagination').empty();

        return;

    }


    const start =
        (currentPage - 1) *
        auctionsPerPage;


    const end =
        start + auctionsPerPage;


    const pageAuctions =
        auctions.slice(
            start,
            end
        );


    container.empty();


    pageAuctions.forEach(function (auction) {

        const image =
            auction.image ||
            'images/auction-placeholder.jpg';


        const title =
            auction.title ||
            'مزاد بدون عنوان';


        const category =
            auction.category ||
            'متنوع';


        const price =
            Number(
                auction.currentPrice ||
                auction.price ||
                0
            );


        const bids =
            Number(
                auction.bids || 0
            );


        const status =
            auction.status ||
            'نشط';


        const isFavorite =
            isAuctionFavorite(
                auction.id
            );


        const favoriteClass =
            isFavorite
                ? 'favorite-active'
                : '';


        const favoriteIcon =
            isFavorite
                ? 'fa-solid'
                : 'fa-regular';


        container.append(`

            <div class="col-lg-3 col-md-6">

                <div class="auction-card">


                    <div class="auction-image-wrapper">

                        <img
                            src="${image}"
                            alt="${escapeHtml(title)}"
                            class="auction-image">


                        <span class="auction-status">

                            <i class="fa-solid fa-circle"></i>

                            ${escapeHtml(status)}

                        </span>


                        <button
                            type="button"
                            class="favorite-button ${favoriteClass}"
                            data-id="${auction.id}"
                            title="${
                                isFavorite
                                    ? 'إزالة من المفضلة'
                                    : 'إضافة إلى المفضلة'
                            }">

                            <i
                                class="${favoriteIcon} fa-heart">
                            </i>

                        </button>

                    </div>


                    <div class="auction-card-body">


                        <span class="auction-category">

                            ${escapeHtml(category)}

                        </span>


                        <h3 class="auction-title">

                            ${escapeHtml(title)}

                        </h3>


                        <div class="auction-price">

                            <span>
                                السعر الحالي
                            </span>


                            <strong>

                                ${formatPrice(price)}

                            </strong>


                            <small>
                                ريال
                            </small>

                        </div>


                        <div class="auction-meta">

                            <span>

                                <i class="fa-solid fa-users"></i>

                                ${bids}

                                مزايدة

                            </span>


                            <a
                                href="auction-details.html?id=${auction.id}"
                                class="btn btn-gold btn-sm">

                                التفاصيل

                                <i class="fa-solid fa-arrow-left"></i>

                            </a>

                        </div>


                    </div>

                </div>

            </div>

        `);

    });


    $('.favorite-button').on(
        'click',
        function () {

            const id =
                $(this).data('id');


            toggleFavorite(id);

        }
    );


    createPagination(
        auctions.length
    );

}


function initFilters() {

    $('#searchInput').on(
        'input',
        function () {

            applyFilters();

        }
    );


    $('#categoryFilter').on(
        'change',
        function () {

            applyFilters();

        }
    );


    $('#sortFilter').on(
        'change',
        function () {

            applyFilters();

        }
    );

}


function applyFilters() {

    const search =
        $('#searchInput')
            .val()
            .trim()
            .toLowerCase();


    const category =
        $('#categoryFilter').val();


    const sort =
        $('#sortFilter').val();


    filteredAuctions =
        allAuctions.filter(
            function (auction) {

                const title =
                    String(
                        auction.title || ''
                    ).toLowerCase();


                const description =
                    String(
                        auction.description || ''
                    ).toLowerCase();


                const auctionCategory =
                    String(
                        auction.category || ''
                    );


                const matchesSearch =

                    title.includes(search) ||

                    description.includes(search);


                const matchesCategory =

                    !category ||

                    auctionCategory === category;


                return (

                    matchesSearch &&

                    matchesCategory

                );

            }
        );


    if (sort === 'price-low') {

        filteredAuctions.sort(
            function (a, b) {

                return (

                    Number(a.currentPrice || a.price || 0) -

                    Number(b.currentPrice || b.price || 0)

                );

            }
        );

    }


    if (sort === 'price-high') {

        filteredAuctions.sort(
            function (a, b) {

                return (

                    Number(b.currentPrice || b.price || 0) -

                    Number(a.currentPrice || a.price || 0)

                );

            }
        );

    }


    if (sort === 'newest') {

        filteredAuctions.sort(
            function (a, b) {

                return (

                    Number(b.id || 0) -

                    Number(a.id || 0)

                );

            }
        );

    }


    currentPage = 1;


    displayAuctions(
        filteredAuctions
    );

}


function createPagination(totalItems) {

    const pagination =
        $('#pagination');


    pagination.empty();


    const totalPages =
        Math.ceil(
            totalItems /
            auctionsPerPage
        );


    if (totalPages <= 1) {

        return;

    }


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const activeClass =
            page === currentPage
                ? 'active'
                : '';


        pagination.append(`

            <button
                class="pagination-btn ${activeClass}"
                data-page="${page}">

                ${page}

            </button>

        `);

    }


    $('.pagination-btn').on(
        'click',
        function () {

            currentPage =
                Number(
                    $(this).data('page')
                );


            displayAuctions(
                filteredAuctions
            );


            $('html, body').animate({

                scrollTop:
                    $('#auctionsContainer')
                        .offset()
                        .top - 120

            }, 400);

        }
    );

}


function isAuctionFavorite(id) {

    const favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    return favorites.some(
        function (favoriteId) {

            return String(favoriteId) ===
                String(id);

        }
    );

}


function toggleFavorite(id) {

    let favorites =
        JSON.parse(
            localStorage.getItem(
                'mazadatiFavorites'
            )
        ) || [];


    const index =
        favorites.findIndex(
            function (favoriteId) {

                return String(favoriteId) ===
                    String(id);

            }
        );


    if (index === -1) {

        favorites.push(id);

        showToast(
            'تمت إضافة المزاد إلى المفضلة ❤️'
        );

    }
    else {

        favorites.splice(
            index,
            1
        );

        showToast(
            'تمت إزالة المزاد من المفضلة'
        );

    }


    localStorage.setItem(

        'mazadatiFavorites',

        JSON.stringify(favorites)

    );


    displayAuctions(
        filteredAuctions
    );

}


function showToast(message) {

    let toast =
        $('#favoriteToast');


    if (toast.length === 0) {

        $('body').append(`

            <div
                id="favoriteToast"
                class="favorite-toast">

                <i class="fa-solid fa-heart"></i>

                <span></span>

            </div>

        `);


        toast =
            $('#favoriteToast');

    }


    toast.find('span')
        .text(message);


    toast.addClass(
        'show'
    );


    setTimeout(
        function () {

            toast.removeClass(
                'show'
            );

        },
        2500
    );

}


function formatPrice(price) {

    return Number(price)
        .toLocaleString('ar-YE');

}


function escapeHtml(text) {

    return String(text)

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );

}