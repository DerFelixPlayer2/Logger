class Filter {
  _types = ['debug', 'info', 'warn', 'error', 'fatal']
  _sim = true
  _visible = ['debug', 'info', 'warn', 'error', 'fatal']
  _required = ''

  setRequired(tag) {
    this._required = tag
    this._update()
  }

  resetRequired() {
    this._required = ''
    this._update()
  }

  toggle(...tags) {
    for (const tag of tags) {
      if (this._sim || (this._visible.length === 1 && this.isVisible(tag))) {
        this._toggle(...this._types.filter((v) => v !== tag))
        this._sim = !this._sim
      } else this._toggle(tag)
    }
    this._update()
  }

  isVisible(tag) {
    return this._visible.includes(tag)
  }

  areAllVisible(...tag) {
    return tag.every((v) => this.isVisible(v))
  }

  _hide(...tags) {
    this._visible = this._visible.filter((v) => !tags.includes(v))
  }

  _show(...tags) {
    this._visible.push(...tags)
  }

  _toggle(...tags) {
    tags.forEach((tag) => {
      if (this._visible.includes(tag)) this._hide(tag)
      else this._show(tag)
    })
  }

  _update() {
    Array.from(document.getElementById('log').children).forEach((child, i) => {
      if (i === 0) return

      let hasOpt = this._sim,
        hasReq = !this._required || this._required.length === 0
      Array.from(child.classList.entries()).forEach(([, v]) => {
        if (!hasOpt && this._visible.includes(v.substring(4))) hasOpt = true
        if (!hasReq && this._required === v.substring(4)) hasReq = true
      })

      if (hasOpt && hasReq) child.classList.add('active')
      else child.classList.remove('active')
    })
  }
}

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
    'row-' + v.timeString.substring(0, v.timeString.indexOf(' ')),
    'active'
  )
  log.appendChild(div)
})

const filter = new Filter()

document.getElementById('btn-debug').addEventListener('click', (e) => {
  filter.toggle('debug')
  document.getElementById('btn-debug').classList.toggle('active')
})

document.getElementById('btn-info').addEventListener('click', (e) => {
  filter.toggle('info')
  document.getElementById('btn-info').classList.toggle('active')
})

document.getElementById('btn-warn').addEventListener('click', (e) => {
  filter.toggle('warn')
  document.getElementById('btn-warn').classList.toggle('active')
})

document.getElementById('btn-error').addEventListener('click', (e) => {
  filter.toggle('error')
  document.getElementById('btn-error').classList.toggle('active')
})

document.getElementById('btn-fatal').addEventListener('click', (e) => {
  filter.toggle('fatal')
  document.getElementById('btn-fatal').classList.toggle('active')
})

document.getElementById('datepicker').addEventListener('change', (e) => {
  e.target.value ? filter.setRequired(e.target.value) : filter.resetRequired()
})
