// image slider starts here
const sliderContainer = document.querySelector(".slider-container");
const imageContainer = document.querySelector(".image-container");
const sliderImages = document.querySelectorAll(".image-container img");

const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

let counter = 1;
let size = sliderImages[0].clientWidth;

window.addEventListener("resize", () => {
  size = sliderImages[0].clientWidth;
  imageContainer.style.transform = "translateX(" + -size * counter + "px)";
});

imageContainer.style.transform = "translateX(" + -size * counter + "px)";

nextBtn.addEventListener("click", () => {
  if (counter >= sliderImages.length - 1) return;
  imageContainer.style.transition = "transform 0.3s ease-in-out";
  counter++;
  imageContainer.style.transform = "translateX(" + -size * counter + "px)";
});

prevBtn.addEventListener("click", () => {
  if (counter <= 0) return;
  imageContainer.style.transition = "transform 0.3s ease-in-out";
  counter--;
  imageContainer.style.transform = "translateX(" + -size * counter + "px)";
});

imageContainer.addEventListener("transitionend", () => {
  if (sliderImages[counter].id === "lastClone") {
    imageContainer.style.transition = "none";
    counter = sliderImages.length - 2;
    imageContainer.style.transform = "translateX(" + -size * counter + "px)";
  } else if (sliderImages[counter].id === "firstClone") {
    imageContainer.style.transition = "none";
    counter = sliderImages.length - counter;
    imageContainer.style.transform = "translateX(" + -size * counter + "px)";
  }
});

sliderContainer.addEventListener("mouseover", () => {
  prevBtn.style.display = "block";
  nextBtn.style.display = "block";
});

sliderContainer.addEventListener("mouseout", () => {
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
});

// image slider ends here
let itemsLoaded = []; // each array will store name of that kind of item and info
// variables

// end variables area
const productsDOM = document.querySelector(".products");

class Products {
  async getProducts(name) {
    try {
      const link = `./json/${name}.json`;
      let result = await fetch(link);
      console.log("fetch");
      let data = await result.json();
      let products = data.items;

      products = products.map((item) => {
        const { title, price, id, image, brand } = item;
        return { title, price, id, image, brand };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
  saveProductsToArray(products, name) {
    const object = { name: name, products: products };
    itemsLoaded.push(object);
  }
}

class UI {
  displayProducts(products) {
    let text1 = "";
    let brand;
    products.forEach((product) => {
      if (product.brand !== brand) {
        text1 += `
          <div class="brand-header">
            <h2>${product.brand}</h2>
          </div>
        `;
      }
      text1 += `
        <div class="product">
        <div class="img-container">
          <img class="product-img" src="${product.image}" alt="" />
        </div>
        <h3>${product.title}</h3>
        <h4>$<span data-id="${product.id}">${product.price}</span></h4>
        <button class="bag-btn" data-id="${product.id}">Add To Bag</button>
      </div>
      `;
      brand = product.brand;
    });

    productsDOM.innerHTML = text1;
  }
}

class Store {
  static saveArrayProducts() {
    localStorage.setItem("arr", JSON.stringify(itemsLoaded));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  products.getProducts("smartphone").then((product) => {
    ui.displayProducts(product);
    products.saveProductsToArray(product, "smartphone");
    Store.saveArrayProducts();
  });

  const boxesDOM = [...document.querySelectorAll(".box")];
  let index = 0;
  boxesDOM[index].classList.add("boxActive");

  boxesDOM.forEach((box) => {
    box.addEventListener("click", () => {
      boxesDOM[index].classList.remove("boxActive");
      box.classList.add("boxActive");
      index = boxesDOM.indexOf(box);

      let name = box.id;
      let temp = 0;
      for (let i = 0; i < itemsLoaded.length && temp === 0; i++) {
        if (itemsLoaded[i].name === name) {
          ui.displayProducts(itemsLoaded[i].products);
          temp = 1;
        }
      }
      if (temp === 0) {
        products.getProducts(name).then((product) => {
          ui.displayProducts(product);
          products.saveProductsToArray(product, name);
          Store.saveArrayProducts();
        });
      }
    });
  });
});