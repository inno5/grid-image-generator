<template>
  <div class="page">
    <!-- ヘッダ -->
    <div class="header">
      <button class="btn btn-a-1" @click="onClickBack">
        <i class="material-icons">arrow_back_ios_new</i>
      </button>
      <button class="btn btn-a-2 blank">
        <i class="material-icons">add</i>
      </button>
      <div class="title">編集</div>
      <button class="btn btn-b-1 blank">
        <i class="material-icons">add</i>
      </button>
      <button class="btn btn-b-2" @click="onClickHelp">
        <i class="material-icons">help_outline</i>
      </button>
    </div>

    <!-- ぼで -->
    <div class="body">
      <div class="note">ドラッグで場所入れ替え。タップでトリミング</div>
      <!-- グリッド -->
      <div class="stage">
        <draggable
          draggable=".draggable-item"
          ref="gridRef"
          class="grid-container"
          tag="div"
          v-model="items"
          :delay="isPC ? 0 : 30"
          :animation="200"
          :move="onDragMove"
          @end="onDragEnd"
          @start="onDragStart"
        >
          <!-- グリッドアイテム -->
          <div
            class="grid-item draggable-item"
            v-for="item in items"
            :key="item.id"
            @click="onItemClick(item)"
          >
            <img
              v-if="item"
              :src="item.mediaInfo.imagePath"
              :style="getItemImageStyle(item)"
            />
          </div>
          <!-- ダミー -->
          <div class="grid-item" v-for="num in getDummy()" :key="num"></div>
        </draggable>
      </div>
    </div>

    <!-- 降った -->
    <div class="footer">
      <div class="ctrl-row">
        <div class="ctrl-col ctrl-col-count">
          <div class="label">列の数</div>
          <div class="btn plus-btn" @click="setGridSize('col', 1)">
            <i class="material-icons">add_circle_outline</i>
          </div>
          <div class="btn minus-btn" @click="setGridSize('col', -1)">
            <i class="material-icons">remove_circle_outline</i>
          </div>
        </div>
        <div class="ctrl-col ctrl-col-count">
          <div class="label">縦横比</div>
          <div class="btn plus-btn" @click="setAspect(true)">
            <i class="material-icons">add_circle_outline</i>
          </div>
          <div class="btn minus-btn" @click="setAspect(false)">
            <i class="material-icons">remove_circle_outline</i>
          </div>
        </div>
      </div>
      <div class="ctrl-row">
        <div class="ctrl-col ctrl-col-color">
          <div class="label">線の色</div>
          <div
            class="color-view"
            :style="{ backgroundColor: gridColor.hex }"
            @click="showColorModal = true"
          ></div>
        </div>

        <div class="ctrl-col ctrl-col-width">
          <div class="label">線の幅</div>
          <div class="btn plus-btn" @click="setGridWidth(1)">
            <i class="material-icons">add_circle_outline</i>
          </div>
          <div class="btn minus-btn" @click="setGridWidth(-1)">
            <i class="material-icons">remove_circle_outline</i>
          </div>
        </div>
      </div>

      <div class="buttons">
        <button class="btn common-btn" @click="generateImage">画像生成</button>
      </div>
    </div>

    <!-- 編集モーダル -->
    <div class="edit-modal" v-if="selectedItem">
      <div class="edit-modal-body">
        <div class="mask" ref="maskRef">
          <div class="spacer" :style="{ paddingTop: 100 * aspect + '%' }"></div>
          <img
            class="image"
            :src="selectedItem.mediaInfo.imagePath"
            :style="getItemImageStyle(selectedItem)"
            @mousedown="onEditorTouchStart"
            @mousemove="onEditorTouchMove"
            @touchstart="onEditorTouchStart"
            @mouseup="onEditorTouchEnd"
            @touchmove="onEditorTouchMove"
            @touchend="onEditorTouchEnd"
          />
        </div>

        <div class="slider-container">
          <div class="label">scale</div>
          <vue-slider
            class="slider"
            v-model="selectedItem.scale"
            :min="0.2"
            :max="3"
            :interval="0.01"
            dotSize="28"
            width="100%"
          ></vue-slider>
        </div>
        <button class="common-btn reset-btn" @click="resetItem(selectedItem)">
          Reset
        </button>
        <button class="common-btn ok-btn" @click="selectedItem = null">
          OK
        </button>
      </div>
    </div>

    <!-- カラーモーダル -->
    <div
      class="color-modal"
      v-if="showColorModal"
      @click="showColorModal = false"
    >
      <color-picker
        class="color-picker"
        v-model="gridColor"
        @input="onColorSelect"
      ></color-picker>
    </div>

    <!-- プレビューモーダル -->
    <div class="preview-modal" v-if="showPreviewModal">
      <div class="preview-modal-body">
        <div class="preview-area">
          <img :src="previewSrc" />
        </div>
        <div class="preview-footer">
          <p>
            画像を長押しとか右クリックで保存してください。ご利用ありがとうございました！
          </p>
          <button class="common-btn" @click="showPreviewModal = false">
            閉じる
          </button>
        </div>
      </div>
    </div>

    <div class="loading-modal" v-if="isLoading">
      <span class="icon material-icons">autorenew</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/common";

.page {
  > .body {
    overflow: hidden;
    flex-direction: column;

    .note {
      position: relative;
      top: 8px;
      font-size: 11px;
      padding-left: 16px;
    }

    .stage {
      flex-grow: 1;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
    }
  }

  .grid-container {
    display: block;
    position: relative;
    margin: 0 auto;
    box-sizing: border-box;

    .grid-item {
      position: absolute;
      box-sizing: border-box;
      overflow: hidden;
      background-color: #fff;

      &.sortable-ghost {
        border-color: $color-main !important;
        border-width: 2px;
        img {
          opacity: 0.2;
        }
      }
      &.sortable-drag {
        border-color: $color-main !important;
        border-width: 2px;
        opacity: 1 !important;
        background-color: rgba($color: #fff, $alpha: 0.8);
        img {
          opacity: 0.8;
        }
      }

      // 動的に設定される
      // > .spacer {
      //   padding-top: 133.33%; /* 高さを幅の75%に固定 */
      // }

      img {
        display: block;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        object-fit: contain;
      }
    }
  }

  .color-modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba($color: #000000, $alpha: 0.3);

    display: flex;
    align-items: center;
    justify-content: center;

    .color-picker {
      max-width: 85%;
      height: auto;
      max-height: 70%;
    }
  }

  .edit-modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba($color: #000000, $alpha: 0.3);

    .edit-modal-body {
      position: absolute;
      $padding: 12px;
      top: $padding;
      bottom: $padding;
      left: $padding;
      right: $padding;
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .mask {
        position: relative;
        width: 70%;
        border: solid 1px #f00;
        overflow: hidden;

        .spacer {
          //
        }
        .image {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          object-fit: contain;
          @include no-touch;
        }
      }

      .slider-container {
        margin-top: 24px;
        width: 60%;
        display: flex;
        flex-direction: row;
        align-items: center;
        .label {
          margin-right: 16px;
        }
        .slider {
        }
      }

      .reset-btn {
        margin-top: 16px;
      }
      .ok-btn {
        margin-top: 16px;
      }
    }
  }

  .preview-modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba($color: #000000, $alpha: 0.3);
    display: flex;
    align-items: center;

    .preview-modal-body {
      position: absolute;
      $padding: 12px;
      left: $padding;
      right: $padding;
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .preview-area {
        padding: 16px;
        img {
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: contain;
          -webkit-touch-callout: default; /* リンク長押しのポップアップを無効化 */
        }
      }
      .preview-footer {
        padding: 0 16px 16px 16px;

        p {
          margin-bottom: 12px;
          line-height: 1.8;
        }
      }
    }
  }

  .loading-modal {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba($color: #000000, $alpha: 0.3);
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 20vw;
      color: rgba($color: #fff, $alpha: 0.6);
      animation: 1s linear infinite rotation;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }

  .footer {
    .buttons {
      margin-top: 8px;

      .btn {
        width: 100%;
      }
    }

    .ctrl-row {
      display: flex;
      align-items: center;
      justify-content: center;

      .ctrl-col {
        flex: 1;
        display: flex;
        align-items: center;

        .label {
          text-align: left;
          margin-right: 6px;
        }

        .inp input {
          width: 80px;
          border-bottom: solid 1px $color-black;
          background-color: #efefef;
          padding: 4px;
          font-size: 16px;
          outline: none;
        }

        .btn {
          font-size: 28px;
          i {
            margin: 4px;
          }
        }

        .color-view {
          width: 40px;
          height: 24px;
          margin: 4px;
          border: solid 2px rgba($color: #000000, $alpha: 0.5);
          border-radius: 4px;
        }
      }
    }
  }
}
</style>

<script lang="ts">
import { MediaInfo } from "@/interface";
import { downloadCanvasImage, getMediaData, isPC } from "@/utils/util";
import { Component, Vue } from "vue-property-decorator";
import draggable, { MoveEvent } from "vuedraggable";
import PinchScrollZoom from "@coddicat/vue-pinch-scroll-zoom";
import { APP_VERSION } from "@/constant";
import { Photoshop, Compact, Swatches } from "vue-color";
import { authService } from "@/services/auth-service";

interface EditorItem {
  id: string;
  scale: number;
  offsetX: number;
  offsetY: number;
  mediaInfo: MediaInfo;
}

const defaultAspect = 1.3;

@Component({
  components: {
    draggable,
    PinchScrollZoom,
    "color-picker": Swatches,
  },
})
export default class Editor extends Vue {
  colCount = 1;
  rowCount = 1;
  aspect = defaultAspect;
  gridColor = {
    hex: "#000000",
  };
  gridBorderWidth = 1;
  showColorModal = false;
  showPreviewModal = false;
  isLoading = false;

  previewSrc = "";

  items: EditorItem[] = [];
  selectedItem: EditorItem | null = null;
  isPC = isPC();

  created(): void {
    authService.logPageView("編集");

    let data: MediaInfo[] = getMediaData();
    if (!data || data.length == 0) {
      this.$router.replace("/");
    }

    const dataCount = data.length;

    let col = 1;
    let row = 1;
    for (;;) {
      if (col * row >= dataCount) {
        break;
      }
      col++;
      if (col * row >= dataCount) {
        break;
      }
      row++;

      if (col > 50) {
        break;
      }
    }
    this.colCount = col;
    this.rowCount = row;

    data.forEach((mi) => {
      this.items.push({
        id: mi.id,
        mediaInfo: mi,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      });
    });
  }

  mounted(): void {
    this.$nextTick(() => {
      this.updateView();
    });
  }

  updateView(): void {
    const gridContainer = (this.$refs.gridRef as Vue).$el as HTMLDivElement;
    const parent = gridContainer.parentElement as HTMLDivElement;
    const aspect = this.aspect;
    const colCount = this.colCount;
    const rowCount = Math.ceil(this.items.length / colCount);
    const borderSize = this.gridBorderWidth;

    let totalWidth = parent.offsetWidth * 0.9;
    let gridBorderWidth = (totalWidth - (colCount + 1) * borderSize) / colCount;
    let gridHeight = gridBorderWidth * aspect;
    let totalHeight = gridHeight * rowCount + borderSize * (rowCount + 1);
    if (totalHeight > parent.offsetHeight * 0.9) {
      totalHeight = parent.offsetHeight * 0.9;
      gridHeight = (totalHeight - (rowCount + 1) * borderSize) / rowCount;
      gridBorderWidth = gridHeight / aspect;
      totalWidth = gridBorderWidth * colCount + borderSize * (colCount + 1);
    }

    gridContainer.style.width = totalWidth + "px";
    gridContainer.style.height = totalHeight + "px";
    gridContainer.style.backgroundColor = this.gridColor.hex;

    const gi = gridContainer.querySelectorAll<HTMLDivElement>(".grid-item");
    gi.forEach((elm, idx) => {
      const x = idx % colCount;
      const y = Math.floor(idx / colCount);
      elm.style.width = gridBorderWidth + "px";
      elm.style.height = gridHeight + "px";
      elm.style.left = gridBorderWidth * x + borderSize * (x + 1) + "px";
      elm.style.top = gridHeight * y + borderSize * (y + 1) + "px";
    });
  }

  /**
   * 画像生成
   */
  generateImage(): void {
    const gridContainer = (this.$refs.gridRef as Vue).$el as HTMLDivElement;
    const gridItem = gridContainer.querySelector<HTMLDivElement>(".grid-item");
    if (!gridItem) {
      return;
    }
    this.isLoading = true;

    const aspect = this.aspect;
    const colCount = this.colCount;
    const rowCount = Math.ceil(this.items.length / colCount);
    const maxCanvasSize = 4096;

    const borderScale = this.gridBorderWidth / gridContainer.offsetWidth;
    const borderWidth = Math.floor(maxCanvasSize * borderScale);
    let gridWidth: number;
    let gridHeight: number;
    // キャンバスが横長
    if (colCount * 1 > rowCount * aspect) {
      gridWidth = Math.floor(
        (maxCanvasSize - borderWidth * (colCount + 1)) / colCount
      );
      gridHeight = Math.floor(gridWidth * aspect);
    }
    // キャンバスが縦長
    else {
      gridHeight = Math.floor(
        (maxCanvasSize - borderWidth * (rowCount + 1)) / rowCount
      );
      gridWidth = Math.floor(gridHeight / aspect);
    }

    const canvasWidth = gridWidth * colCount + borderWidth * (colCount + 1);
    const canvasHeight = gridHeight * rowCount + borderWidth * (rowCount + 1);

    const cvs = document.createElement("canvas");
    cvs.width = canvasWidth;
    cvs.height = canvasHeight;
    const ctx = cvs.getContext("2d") as CanvasRenderingContext2D;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = this.gridColor.hex;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#FFFFFF";
    // 枠を描画
    for (let i = 0; i < colCount * rowCount; i++) {
      const x = i % colCount;
      const y = Math.floor(i / colCount);
      const dx = gridWidth * x + borderWidth * (x + 1);
      const dy = gridHeight * y + borderWidth * (y + 1);
      ctx.fillRect(dx, dy, gridWidth, gridHeight);
    }

    // 各画像を描画
    let completeCount = 0;
    for (let i = 0; i < this.items.length; i++) {
      const x = i % colCount;
      const y = Math.floor(i / colCount);

      const item = this.items[i];
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = item.mediaInfo.imagePath;
      img.onload = () => {
        let dx = gridWidth * x + borderWidth * (x + 1);
        let dy = gridHeight * y + borderWidth * (y + 1);
        let dw = gridWidth;
        let dh = gridWidth * (img.height / img.width);
        if (dh > gridHeight) {
          dh = gridHeight;
          dw = gridHeight / (img.height / img.width);
        }

        // scaleを適応
        let dx2 = dx + (gridWidth - dw) / 2;
        let dy2 = dy + (gridHeight - dh) / 2;
        dx2 -= (item.scale * dw - dw) / 2;
        dy2 -= (item.scale * dh - dh) / 2;
        dw *= item.scale;
        dh *= item.scale;
        // translateを適応
        dx2 += gridWidth * (item.offsetX / 100) * item.scale;
        dy2 += gridHeight * (item.offsetY / 100) * item.scale;
        // 描画
        ctx.save();
        ctx.beginPath();
        ctx.rect(dx, dy, gridWidth, gridHeight);
        ctx.clip();
        ctx.drawImage(img, 0, 0, img.width, img.height, dx2, dy2, dw, dh);
        ctx.restore();

        completeCount++;
        if (completeCount >= this.items.length) {
          // downloadCanvasImage(cvs);
          this.previewSrc = cvs.toDataURL();
          this.showPreviewModal = true;
          this.isLoading = false;

          authService.logPageView("プレビュー");
        }
      };
    }

    //
    cvs.style.width = "100%";
    cvs.style.height = "auto";
    cvs.style.position = "absolute";
    cvs.style.top = "0";
    cvs.style.left = "0";
    cvs.style.zIndex = "100";
  }

  /**
   *
   */
  movingIndex = -1;
  futureIndex = -1;
  onDragStart(): void {
    this.movingIndex = -1;
    this.futureIndex = -1;
  }

  onDragEnd(): void {
    if (this.movingIndex < 0 || this.futureIndex < 0) {
      return;
    }

    const futureItem = this.items[this.futureIndex];
    const movingItem = this.items[this.movingIndex];
    this.items[this.movingIndex] = futureItem;
    this.items[this.futureIndex] = movingItem;
    this.items.splice(0, 0);
    this.$nextTick(() => {
      this.updateView();
    });
  }
  onDragMove(e: MoveEvent<EditorItem>): boolean {
    const { index, futureIndex } = e.draggedContext;
    this.movingIndex = index;
    this.futureIndex = futureIndex;
    return false; // disable sort
  }

  onItemClick(item: EditorItem): void {
    this.selectedItem = item;
  }

  getItemImageStyle(item: EditorItem) {
    const style = {
      transform: `scale(${item.scale}) translateX(${item.offsetX}%) translateY(${item.offsetY}%)`,
    };
    return style;
  }

  resetItem(item: EditorItem): void {
    item.scale = 1;
    item.offsetX = 0;
    item.offsetY = 0;
  }

  setGridSize(type: "col" | "row", count: number): void {
    if (type == "col") {
      this.colCount += count;
      if (this.colCount < 1) {
        this.colCount = 1;
      } else if (this.colCount > 12) {
        this.colCount = 12;
      }
    } else if (type == "row") {
      this.rowCount += count;
    }

    this.$nextTick(() => {
      this.updateView();
    });
  }

  setGridWidth(count: number): void {
    this.gridBorderWidth += count;
    if (this.gridBorderWidth < 0) {
      this.gridBorderWidth = 0;
    } else if (this.gridBorderWidth > 12) {
      this.gridBorderWidth = 12;
    }

    this.$nextTick(() => {
      this.updateView();
    });
  }

  setAspect(add: boolean): void {
    this.aspect += add ? 0.1 : -0.1;
    if (this.aspect < 0.5) {
      this.aspect = 0.5;
    } else if (this.aspect > 2) {
      this.aspect = 2;
    }

    this.$nextTick(() => {
      this.updateView();
    });
  }

  onColorSelect(a: any) {
    this.showColorModal = false;
    this.updateView();
  }

  getDummy() {
    if (this.items.length % this.colCount == 0) {
      return 0;
    } else {
      return this.colCount - (this.items.length % this.colCount);
    }
  }

  /**
   * 移動
   */
  imageEditting = false;
  editorLastX = 0;
  editorLastY = 0;
  onEditorTouchStart(e: MouseEvent | TouchEvent): void {
    this.imageEditting = true;

    let tx = 0,
      ty = 0;
    if (e instanceof MouseEvent) {
      tx = e.pageX;
      ty = e.pageY;
    } else if (e instanceof TouchEvent) {
      tx = e.touches[0].pageX;
      ty = e.touches[0].pageY;
    }

    this.editorLastX = tx;
    this.editorLastY = ty;
  }
  onEditorTouchMove(e: MouseEvent | TouchEvent): void {
    if (!this.imageEditting) {
      return;
    }

    let tx = 0,
      ty = 0;
    if (e instanceof MouseEvent) {
      tx = e.pageX;
      ty = e.pageY;
    } else if (e instanceof TouchEvent) {
      tx = e.touches[0].pageX;
      ty = e.touches[0].pageY;
    }

    if (this.selectedItem) {
      const mask = this.$refs.maskRef as HTMLDivElement;
      this.selectedItem.offsetX +=
        ((tx - this.editorLastX) / mask.clientWidth) * 100;
      this.selectedItem.offsetY +=
        ((ty - this.editorLastY) / mask.clientHeight) * 100;
      this.editorLastX = tx;
      this.editorLastY = ty;

      console.log(this.selectedItem.offsetX, this.selectedItem.offsetY);
    }
  }
  onEditorTouchEnd(): void {
    this.imageEditting = false;
  }

  onClickBack() {
    if (confirm("編集中のデータは破棄されます")) {
      this.$router.replace("/");
    }
  }
  onClickHelp() {
    alert(`
version: ${APP_VERSION}
改善のご要望、バグ報告は Twitter @ankake_yakisova まで。
    `);
  }
}
</script>
