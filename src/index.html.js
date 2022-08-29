var types = ['debug', 'info', 'warn', 'error', 'fatal']
var showDebug = false,
  showInfo = false,
  showWarn = false,
  showError = false,
  showFatal = false
var data = []

var log = document.getElementById('log')
data.forEach((v) => {
  var div = document.createElement('div')
  div.innerHTML = `
            <div class="time-wrapper"><p class="time">${v.timeString}</p></div>
            <div class="tag-wrapper"><p class="tag">${v.tag}</p></div>
            <div class="type-wrapper"><div class="type-wrapper2 ${v.level.toLowerCase()}"><p class="type">${
    v.level
  }</p></div></div>
            <div class="msg-wrapper"><p class="msg">${v.msg}</p></div>
          `
  div.classList.add(
    'row',
    'row-' + v.level.toLowerCase(),
    'row-' + v.timeString.substring(0, v.timeString.indexOf(' '))
  )
  log.appendChild(div)
})

function toggle(type) {
  if (allDisabled() || allDisabledAfter(type))
    _toggle(...types.filter((v) => v !== type))
  else _toggle(type)
  toggleShow(type)
  toggleButton(type)
}

function _toggle(...type) {
  for (var t of type) {
    Array.from(
      document.getElementById('log').getElementsByClassName('row-' + t)
    ).forEach((v) => {
      v.classList.toggle('hide')
    })
  }
}

function toggleShow(type) {
  switch (type) {
    case 'debug':
      showDebug = !showDebug
      break
    case 'info':
      showInfo = !showInfo
      break
    case 'warn':
      showWarn = !showWarn
      break
    case 'error':
      showError = !showError
      break
    case 'fatal':
      showFatal = !showFatal
      break
  }
}

function toggleButton(type) {
  switch (type) {
    case 'debug':
      document.getElementById('btn-debug').classList.toggle('active')
      break
    case 'info':
      document.getElementById('btn-info').classList.toggle('active')
      break
    case 'warn':
      document.getElementById('btn-warn').classList.toggle('active')
      break
    case 'error':
      document.getElementById('btn-error').classList.toggle('active')
      break
    case 'fatal':
      document.getElementById('btn-fatal').classList.toggle('active')
      break
  }
}

function allDisabled() {
  return !showDebug && !showInfo && !showWarn && !showError && !showFatal
}

function allDisabledAfter(type) {
  switch (type) {
    case 'debug':
      return showDebug && !showInfo && !showWarn && !showError && !showFatal
    case 'info':
      return !showDebug && showInfo && !showWarn && !showError && !showFatal
    case 'warn':
      return !showDebug && !showInfo && showWarn && !showError && !showFatal
    case 'error':
      return !showDebug && !showInfo && !showWarn && showError && !showFatal
    case 'fatal':
      return !showDebug && !showInfo && !showWarn && !showError && showFatal
  }
}
