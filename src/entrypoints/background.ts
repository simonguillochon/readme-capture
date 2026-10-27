// Les types de `browser` fournis par WXT ne couvrent pas l'API Firefox `sidebarAction`.
type FirefoxBrowser = typeof browser & {
  sidebarAction: { toggle(): Promise<void> };
};

export default defineBackground(() => {
  browser.action.onClicked.addListener(() => {
    (browser as FirefoxBrowser).sidebarAction.toggle();
  });
});
