// catalog.js
document.addEventListener("DOMContentLoaded", () => {
    
    // Ensure Firebase DB is loaded
    setTimeout(initCatalog, 500);

    function initCatalog() {
        if (!window.db) return;

        const grids = document.querySelectorAll('.dynamic-product-grid');
        if (grids.length === 0) return;

        grids.forEach(grid => {
            const rawCats = grid.dataset.categories || "";
            if (!rawCats) return;
            
            const catsArr = rawCats.split(',').map(c => c.trim().toLowerCase());
            
            // Show loading spinner
            grid.innerHTML = '<div class="col-12 text-center py-5"><i class="fa-solid fa-spinner fa-spin fs-2 text-muted"></i><p class="mt-2 text-muted small text-uppercase">Fetching Latest Drops...</p></div>';

            db.collection("products")
              .where("category", "in", catsArr)
              .orderBy("createdAt", "desc")
              .get()
              .then(snap => {
                  renderSnapshot(snap, grid);
              })
              .catch(err => {
                  console.error("Catalog Fetch Error:", err);
                  
                  // Firestore requires composite indexes for 'in' + 'orderBy'. 
                  // If not created yet, fallback to simple query and client-side sort.
                  if (err.message.includes("index")) {
                      db.collection("products").where("category", "in", catsArr).get()
                      .then(snap2 => renderSnapshot(snap2, grid, true));
                  } else {
                      grid.innerHTML = '';
                  }
              });
        });
    }

    function renderSnapshot(snap, grid, forceClientSort = false) {
        grid.innerHTML = '';
        if (snap.empty) return;

        let items = [];
        snap.forEach(doc => items.push({...doc.data(), id: doc.id}));

        if (forceClientSort) {
            items.sort((a,b) => {
                const aTime = a.createdAt ? a.createdAt.seconds : 0;
                const bTime = b.createdAt ? b.createdAt.seconds : 0;
                return bTime - aTime;
            });
        }

        items.forEach(p => {
            // Re-using the Urban Edge exact product card HTML structure
            const cardHtml = `
              <div class="col-lg-3 col-md-4 col-sm-6 mb-4" style="animation: fadeIn 0.5s;">
                  <div class="product-card position-relative h-100 border-0 bg-transparent">
                      <div class="position-relative bg-light mb-3 product-img-box overflow-hidden" style="aspect-ratio: 4/5;">
                          <span class="badge bg-danger text-white rounded-0 position-absolute top-0 start-0 m-2 px-2 py-1" style="font-size: 9px; z-index: 2; letter-spacing: 1px;">NEW DROP</span>
                          <img src="${p.img}" alt="${p.name}" class="img-fluid w-100 h-100 product-img" style="object-fit: cover;">
                          <div class="quick-add-box position-absolute bottom-0 start-0 w-100 p-2 z-3 text-center">
                              <button class="btn btn-dark w-100 rounded-0 fw-bold text-uppercase py-2 shadow-sm dynamic-add-btn" style="font-size: 10px; letter-spacing: 1px;">Add to Bag +</button>
                          </div>
                      </div>
                      <div class="p-2 text-center bg-transparent">
                          <h6 class="fw-bold mb-1 text-truncate" style="font-size: 13px;">${p.name}</h6>
                          <div class="color-swatches d-flex justify-content-center gap-1 mb-2">
                              <span class="swatch-circle shadow-sm bg-dark" title="Black"></span>
                          </div>
                          <p class="fw-bolder m-0 text-danger" style="font-size: 14px;">Rs. ${p.price}</p>
                      </div>
                  </div>
              </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Bind newly created buttons to the powerful cart interception logic
        if (window.bindCartButton) {
            const newBtns = grid.querySelectorAll('.dynamic-add-btn');
            newBtns.forEach(btn => window.bindCartButton(btn));
        }
    }
});
