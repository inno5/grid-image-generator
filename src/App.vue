<template>
  <div id="app">
    <keep-alive include="first-page">
      <router-view />
    </keep-alive>
  </div>
</template>

<style lang="scss">
body {
  overflow: hidden;
  font-size: 12px;
  color: #333;
  -webkit-touch-callout: none; /* リンク長押しのポップアップを無効化 */
  -webkit-user-select: none; /* テキスト長押しの選択ボックスを無効化 */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
