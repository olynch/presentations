const cur = parseInt(window.CUR);
const total = parseInt(window.TOTAL);
const next = cur < total ? cur + 1 : undefined;
const prev = cur > 1 ? cur - 1 : undefined;

document.addEventListener("keydown", (e) => {
    if (["Space", "ArrowRight", "j"].includes(e.key) && next !== undefined) {
        window.location.href = `${next}.html`;
    } else if (
        ["Backspace", "ArrowLeft", "k"].includes(e.key) &&
        prev !== undefined
    ) {
        window.location.href = `${prev}.html`;
    }
});
