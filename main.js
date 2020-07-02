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

// nav bar drop down
const hamburger = document.querySelector(".nav-icon");
const navbarLIST = document.querySelector(".nav-bar-list");
hamburger.addEventListener("mouseover", () => {
  navbarLIST.style.opacity = "1";
  navbarLIST.style.pointerEvents = "all";
  onClick = true;
});

hamburger.addEventListener("mouseout", () => {
  navbarLIST.style.opacity = "0";
  navbarLIST.style.pointerEvents = "none";
  onClick = false;
});
// end nav bar drop down

let itemsLoaded = []; // each array will store name of that kind of item and info
let userCart = [];
let allButtons = [];
// variables

// end variables area
const productsDOM = document.querySelector(".products");
const amountPicked = document.querySelector(".cart-items");
const totalMoney = document.querySelector("#your-total");
const cartOverlay = document.querySelector(".cart-overlay");
const mainCart = document.querySelector(".cart");
const cartButton = document.querySelector(".cart-btn");
const closeButtonInCart = document.querySelector(".fa-window-close");
const cartContent = document.querySelector(".cart-content");

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
  getBagButtons(name) {
    let buttons = document.querySelectorAll(".bag-btn");
    buttons.forEach((button) => {
      const id = parseInt(button.dataset.id);
      const inCart = userCart.find((item) => item.info.id === id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        const id = parseInt(event.target.dataset.id);
        let target;
        for (let i = 0; i < itemsLoaded.length; i++) {
          if (itemsLoaded[i].name === name) {
            target = itemsLoaded[i];
          }
        }
        const product = target.products.find((item) => item.id === id);
        const picked = { info: product, amount: 1 };
        userCart.push(picked);
        Store.saveCartToLocal(userCart);
        this.updateCartInfo(userCart);
        this.openCart();
        this.displayCart(userCart);
      });
    });
  }

  updateCartInfo(userCart) {
    let money = 0;
    let amount = 0;

    userCart.forEach((one) => {
      amount += one.amount;
      money += one.info.price * one.amount;
    });

    amountPicked.innerText = amount;
    totalMoney.innerText = money;
  }

  openCart() {
    cartOverlay.classList.add("showCartOverlay");
    mainCart.classList.add("showCart");
  }

  closeCart() {
    cartOverlay.classList.remove("showCartOverlay");
    mainCart.classList.remove("showCart");
  }

  displayCart(cart) {
    let result = "";
    cart.forEach((item) => {
      result += `
          <div class="cart-item">
            <img src="${item.info.image}" alt="" />
            <div class="info-remove">
              <h3>${item.info.title}</h3>
              <h4>$<span data-id="${item.info.id}">${item.info.price}</span></h4>
              <button class="remove-item" data-id="${item.info.id}">remove</button>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id="${item.info.id}"></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id="${item.info.id}"></i>
            </div>
          </div>
    `;
    });
    cartContent.innerHTML = result;
  }

  removeOneItem(id) {
    id = parseInt(id);
    userCart = userCart.filter((one) => one.info.id !== id);
    this.updateCartInfo(userCart);
    Store.saveCartToLocal(userCart);
    const buttons = [...document.querySelectorAll(".bag-btn")];
    const button = buttons.find((one) => parseInt(one.dataset.id) === id);
    if (button) {
      button.disabled = false;
      button.innerText = "Add To Bag";
    }
    this.displayCart(userCart);
  }

  placeOrderFunction() {
    userCart.forEach((one) => {
      this.removeOneItem(one.info.id);
    });
  }

  inCartEvents() {
    mainCart.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        this.removeOneItem(event.target.dataset.id);
      } else if (event.target.classList.contains("place-order")) {
        this.placeOrderFunction();
      } else if (event.target.classList.contains("fa-chevron-up")) {
        const id = parseInt(event.target.dataset.id);
        let item = userCart.find((one) => one.info.id === id);
        item.amount++;
        Store.saveCartToLocal(userCart);
        this.updateCartInfo(userCart);
        event.target.nextElementSibling.innerText = item.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const id = parseInt(event.target.dataset.id);
        let item = userCart.find((one) => one.info.id === id);
        item.amount--;
        if (item.amount <= 0) {
          this.removeOneItem(id);
        } else {
          Store.saveCartToLocal(userCart);
          this.updateCartInfo(userCart);
          event.target.previousElementSibling.innerText = item.amount;
        }
      }
    });
  }

  settings() {
    userCart = Store.loadCart();
    this.updateCartInfo(userCart);
    cartButton.addEventListener("click", this.openCart);
    closeButtonInCart.addEventListener("click", this.closeCart);
    cartOverlay.addEventListener("click", (event) => {
      if (event.target.classList.contains("cart-overlay")) {
        this.closeCart();
      }
    });
    this.displayCart(userCart);
  }
}

class Store {
  static saveArrayProducts() {
    localStorage.setItem("arr", JSON.stringify(itemsLoaded));
  }
  static saveCartToLocal(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static loadCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.settings();

  products.getProducts("smartphone").then((product) => {
    ui.displayProducts(product);
    products.saveProductsToArray(product, "smartphone");
    Store.saveArrayProducts();
    ui.getBagButtons("smartphone");
    ui.inCartEvents();
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
          ui.getBagButtons(name);
        }
      }
      if (temp === 0) {
        products.getProducts(name).then((product) => {
          ui.displayProducts(product);
          products.saveProductsToArray(product, name);
          Store.saveArrayProducts();
          ui.getBagButtons(name);
        });
      }
    });
  });
});
