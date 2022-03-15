<template>
  <div class="page">
    <!-- ヘッダ -->
    <div class="header">
      <div class="btn btn-a-1 blank">
        <i class="material-icons">add</i>
      </div>
      <div class="btn btn-a-2 blank">
        <i class="material-icons">add</i>
      </div>
      <div class="title">
        <template v-if="isLoggedIn">画像選択</template>
        <template v-else>はじめに</template>
      </div>
      <div class="btn btn-b-1 blank">
        <i class="material-icons">add</i>
      </div>
      <div
        class="btn btn-b-2"
        :class="{ blank: !isLoggedIn }"
        @click="onLogoutClick"
      >
        <i class="material-icons">logout</i>
      </div>
    </div>

    <div class="body">
      <template v-if="!isLoggedIn">
        <div class="welcome">
          <h1>まとめ画像ジェネレータ</h1>
          <p>
            あなたがTwitterに投稿した画像を選び、格子状に並んだ1枚画像を作成するサービスです。
            <br />
            <a href="/img/sample.png" target="_blank">サンプル画像はこちら</a>
          </p>
          <button class="login-btn common-btn" @click="clickLogin()">
            <div class="label">Twitterアカウントでログイン</div>
            <img
              class="icon"
              src="https://icongr.am/fontawesome/twitter.svg?size=128&amp;color=ffffff"
            />
          </button>

          <p class="note">
            Twitterの仕様上、ログインしてもらわないとうまいこと過去の画像が拾えないのでログインしていただく仕様になってます。
            <br />
            データをサーバに保存するようにはなっていないのでご安心ください。
            <br />
            バグ報告、改善のご要望などありましたら
            <a href="https://twitter.com/ankake_yakisova" target="_blank">
              @ankake_yakisova
            </a>
            まで。
          </p>
        </div>
      </template>

      <template v-else>
        <div class="media-list-container">
          <ul class="media-list">
            <li
              class="media-list-item"
              v-for="media in medias"
              :key="media.id_str"
              @click="clickImage(media)"
              :class="{ selected: media.selected }"
            >
              <img class="image" :src="media.imagePath + ':thumb'" />

              <i class="selected-icon material-icons" v-if="media.selected">
                check_circle
              </i>

              <div class="info1">
                <div class="info-fav">
                  <i class="material-icons">favorite</i>
                  <span>{{ media.favoriteCount }}</span>
                </div>
                <div class="info-ret">
                  <i class="material-icons">repeat</i>
                  <span>{{ media.retweetCount }}</span>
                </div>
              </div>
              <div class="info2">
                <i class="material-icons">access_time</i>
                <div class="info-date">{{ media.createdAt | date }}</div>
              </div>
            </li>
          </ul>
          <infinite-loading @infinite="load"></infinite-loading>
        </div>
      </template>
    </div>
    <div class="footer" v-if="isLoggedIn">
      <p class="mes">
        画像を
        <strong>2枚以上</strong>
        選んでね
      </p>
      <p class="mes">
        <strong>{{ getSelectedCount() }}枚</strong>
        選択中
      </p>
      <button
        class="common-btn"
        @click="onClickNext"
        :disabled="getSelectedCount() < 2"
      >
        次へ
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/common";

.body {
  .welcome {
    width: 100%;
    padding: 16px;
    text-align: center;

    > h1 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    > p {
      margin-bottom: 16px;
      line-height: 1.5;
      a {
        color: $color-main;
        text-decoration: underline;
      }
    }

    > p.note {
      background-color: #efefef;
      padding: 16px;
      font-size: 10px;
      text-align: left;
      line-height: 2;
    }

    .sample {
      img {
        width: 70%;
        height: auto;
      }
    }

    .login-btn {
      display: flex;
      align-items: center;
      margin: 0 auto 16px auto;

      .label {
        margin-right: 4px;
      }

      .icon {
        width: 24px;
        height: 24px;
      }
    }
  }

  .media-list-container {
    overflow-y: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .media-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    .media-list-item {
      position: relative;
      width: 33.3333vw;
      border: solid 2px #fff;

      &.selected {
        // border: solid 2px $color-main;
        .image {
          opacity: 0.6;
        }
      }

      .selected-icon {
        color: $color-main;
        position: absolute;
        top: 4px;
        left: 4px;

        background-color: #fff;
        border-radius: 50%;
      }

      .image {
        object-fit: cover;
        display: block;
        width: 100%;
        height: 33.333vw;
        margin-bottom: 6px;
      }

      .info1,
      .info2 {
        display: flex;
        align-items: center;
        font-size: 11px;
        margin-bottom: 4px;

        .info-fav,
        .info-ret {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }

        .material-icons {
          font-size: 12px;
          margin-right: 3px;
        }
      }
    }
  }
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { authService } from "@/services/auth-service";
import { MediaInfo } from "@/interface";
import { StateChanger } from "vue-infinite-loading";
import { saveMediaData } from "@/utils/util";
import { Env } from "@/env/env";

declare const window: any;

@Component({
  name: "first-page",
})
export default class Login extends Vue {
  isLoggedIn = false;
  medias: MediaInfo[] = [];

  created(): void {
    authService.restoreTokenSecret();
    if (authService.userToken) {
      console.log(authService.userToken);
      console.log(authService.userSecret);
      console.log(authService.userId);
      this.isLoggedIn = true;
    }

    authService.logPageView("ログイン");
  }

  async onLogoutClick(): Promise<void> {
    const result = confirm("ログアウトしますか？");
    if (result) {
      await authService.logoutTwitter();
      localStorage.clear();
      this.isLoggedIn = false;
    }
  }

  onClickNext() {
    saveMediaData(this.medias.filter((m) => m.selected));
    this.$router.push("/editor");
  }

  clickLogin(): void {
    authService.loginTwitter(
      () => {
        //
        this.isLoggedIn = true;
        authService.logPageView("画像選択");
      },
      (err) => {
        alert("ログインできませんでした。");
        console.error(err);
      }
    );
  }

  clickImage(media: MediaInfo): void {
    media.selected = !media.selected;
  }

  load(state: StateChanger): void {
    if (!authService.userToken || !authService.userSecret) {
      return;
    }

    const consumerKeySecret = {
      consumer_key: Env.TWITTER_CONSUMER_KEY,
      consumer_secret: Env.TWITTER_CONSUMER_SECRET,
    };

    const accessor = {
      consumerSecret: consumerKeySecret.consumer_secret,
      tokenSecret: authService.userSecret,
    };

    const callbackName =
      "getData" + Math.floor(Math.random() * 9999999) + Date.now().toString();

    const message: any = {
      method: "GET", // リクエストの種類
      action: "https://api.twitter.com/1.1/statuses/user_timeline.json",
      parameters: {
        oauth_version: "1.0",
        oauth_signature_method: "HMAC-SHA1",
        oauth_consumer_key: consumerKeySecret.consumer_key, // コンシューマーキー
        oauth_token: authService.userToken, // アクセストークン
        count: 200,
        result_type: "recent",
        // include_entities: true,
        // exclude_replies: true,
        // include_rts: false,
        callback: callbackName, // 取得したデータをupdate関数に渡すよう設定
      },
    };

    if (this.medias && this.medias.length > 0) {
      message.parameters.max_id = this.medias[this.medias.length - 1].id;
    }

    // OAuth認証
    window.OAuth.setTimestampAndNonce(message);
    window.OAuth.SignatureMethod.sign(message, accessor);
    var url = window.OAuth.addToURL(message.action, message.parameters);

    var script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
    window[callbackName] = (res: any) => {
      if (res) {
        res.forEach((tweet: any) => {
          if (tweet.entities && tweet.entities.media) {
            // 自分の以外のリツイートは省く
            if (tweet.retweeted_status) {
              if (tweet.retweeted_status.user.id_str != authService.userId) {
                return;
              }
            }

            // リプは除外
            // if (tweet.in_reply_to_screen_name != null) {
            //   return;
            // }

            tweet.entities.media.forEach((media: any) => {
              this.medias.push({
                id: media.id_str,
                imagePath: media.media_url_https,
                favoriteCount: tweet.favorite_count,
                retweetCount: tweet.retweet_count,
                createdAt: tweet.created_at,
                data: tweet,
                selected: false,
              });
            });
          }
        });

        if (res.length > 0) {
          state.loaded();
        } else {
          state.complete();
        }
      } else {
        state.error();
      }

      delete window[callbackName];
      document.body.removeChild(script);
    };
  }

  getSelectedCount(): number {
    return this.medias.filter((m) => m.selected).length;
  }
}
</script>
