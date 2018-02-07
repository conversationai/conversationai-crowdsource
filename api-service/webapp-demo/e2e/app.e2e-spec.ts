import {WebappDemoPage} from './app.po';

describe('webapp-demo App', () => {
  let page: WebappDemoPage;

  beforeEach(() => {
    page = new WebappDemoPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
