import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import '@spectrum-web-components/theme/sp-theme.js'
import '@spectrum-web-components/theme/src/themes.js'
import '@spectrum-web-components/icon'
import '@spectrum-web-components/icon/sp-icon.js'
import '@spectrum-web-components/progress-circle/sp-progress-circle.js'


import {
  DownloadIcon,
  CheckmarkCircleIcon,
  setCustomTemplateLiteralTag,
} from '@spectrum-web-components/icons-workflow'

import '@spectrum-web-components/button/sp-button.js'
import '@spectrum-web-components/button/sp-clear-button.js'

import { TemplateResult } from '@spectrum-web-components/icons-workflow/src/custom-tag'

import { connect } from 'pwa-helpers'
import store from '../redux/store.ts'
import { selectAll, selectedAllPhoto, deselectedAllPhoto, positionChangedAll } from '../redux/reducers/photo.ts'
import { overlayHidden } from '../redux/reducers/extension.ts'

/**
 * NOTE: By default, using html template tag in lit-html. but this project use litv3.
 * so diff between templateresult type. so i need this.
 * https://opensource.adobe.com/spectrum-web-components/components/icons-workflow
 */
setCustomTemplateLiteralTag(html)

@customElement('download-button')
class DownloadButton extends connect(store)(LitElement) {
  // Create the controller and store it
  @property()
  selectedPhotos = []

  @property()
  selectablePhotos = []

  @property()
  isDownloadable = true

  @property()
  loading = false

  @property()
  finished = false

  stateChanged(state) {
    this.selectablePhotos = selectAll(state)
    this.selectedPhotos = selectAll(state).filter(entity => entity.selected)
  }

  static styles = css`
    :host {
      all: initial;
    }
    .container {
      z-index: 10000;
      position: fixed;
      bottom: 10px;
      right: 10px;
      display: flex;
      padding: 1em;
      justify-content: space-between;
      align-items: center;
      background-color: var(--spectrum-global-color-gray-100);
      color: var(--spectrum-global-color-gray-800);
      border-radius: 6px;
    }
    .container > *+* {
      margin-left: 1em;
    }
  `

  constructor() {
    super()
    this.addEventListener('click', () => {
      this.selected = !this.selected
    })
  }

  // Use the controller in render()
  render(): TemplateResult {
    return html`
      <sp-theme color="darkest" scale="medium">
        <div class="container">
          ${this.getStatusToast()}
        </div>
      </sp-theme
      >
    `
  }

  private getStatusToast() {
    if (this.finished) {
      return html`
        <sp-icon style="color: var(--spectrum-global-color-static-celery-200);">
          ${CheckmarkCircleIcon()}
        </sp-icon>
        <p>
          Your download has started! You can check the progress of the download
          and cancel it from the Extensions icon from the upper right corner.
        </p>
        <sp-clear-button
            label="Close"
            variant="overBackground"
            @click=${this.closeClickHandler()}
        ></sp-clear-button>
        `
    }
    if (this.loading) {
      return html`
      <sp-progress-circle
        label="A small representation of a somewhat completed action"
        indeterminate
        size="small"
      ></sp-progress-circle>
      <p>Creating a download queue</p>`
    }
    return html`
      ${this.selectedPhotos.length < this.selectablePhotos.length
        ? html`<sp-button quiet variant="secondary" @click=${() => store.dispatch(selectedAllPhoto())}>SelectAll</sp-button>`
        : html`<sp-button quiet variant="secondary" @click=${() =>store.dispatch(deselectedAllPhoto())}>DeselectAll</sp-button>`
      }
      ${this.selectedPhotos.length > 0 ? html`
        <sp-icon
          style="color: var(--spectrum-alias-icon-color-selected);">
          ${CheckmarkCircleIcon()}
        </sp-icon>
        <p style="color: var(--spectrum-alias-text-color-selected);">${this.selectedPhotos.length} photos</p>`
        : html`
        <sp-icon
          style="color: var(--spectrum-alias-icon-color-disabled);">
          ${CheckmarkCircleIcon()}
        </sp-icon>
        <p style="color: var(--spectrum-alias-text-color-disabled);">${this.selectedPhotos.length} photos</p>`
      }
      <sp-button
        @click=${this.clickDownloadHandler}
        ?disabled=${!this.canDownload()}
      >
        <sp-icon slot="icon">${DownloadIcon()}</sp-icon>
        Download
      </sp-button>`
  }

  private canDownload() {
    if (this.selectedPhotos.length === 0) return false
    if (!this.isDownloadable) return false
    return true
  }

  private async clickDownloadHandler(e) {
    this.isDownloadable = false
    this.loading = true
    // dammy. creating download queue
    await new Promise(r => setTimeout(r, 1000))
    this.loading = false
    this.finished = true
    store.dispatch(positionChangedAll({ top: 0, left: 0, width: 0, height: 0, 'z-index': 0 }))
    console.log('dispatch extension to false')
    store.dispatch(overlayHidden())
    console.log(this.selectedPhotos)
  }

  private closeClickHandler() {
    console.log('close toastd')
  }
}

export default DownloadButton
