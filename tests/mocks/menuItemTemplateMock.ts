type MenuItemTemplateData = {
  action?: string;
  direction: string;
  label: string;
  url?: string;
};

export default function menuItemTemplateMock({ action, direction, label, url }: MenuItemTemplateData) {
  if (url) {
    return `<button class="ccm-items ${direction}" onclick="${action ?? ''}"><a href="${url}">${label}</a></button>`;
  }

  return `<button class="ccm-items ${direction}" onclick="${action ?? ''}">${label}</button>`;
}
