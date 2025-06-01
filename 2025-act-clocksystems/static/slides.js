document.addEventListener('keydown', (e) => {
  if (["Space", "ArrowRight"].includes(e.code) && window.NEXT !== undefined) {
    window.location.href = `${window.NEXT}.html`
  } else if (["Backspace", "ArrowLeft"].includes(e.code) && window.PREV !== undefined) {
    window.location.href = `${window.PREV}.html`
  }
})
