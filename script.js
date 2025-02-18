let card = document.querySelector(".card");
let player = document.querySelector(".play");

card.addEventListener('mouseenter', () => {
    player.classList.remove("hidden");
});

card.addEventListener('mouseleave', () => {
    player.classList.add("hidden");
});