class ResizeObserver {
  callback: any = null;

  observer: any = null;

  constructor(callback: any) {
    if (typeof callback === "function") {
      this.callback = callback;
    }
    return this;
  }

  observe(target: any) {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.callback && this.callback();

    this.observer = new MutationObserver((mutations) => {
      this.callback && this.callback();
    });

    this.observer.observe(target, {
      attributes: true,
      attributeOldValue: false,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default ResizeObserver;
