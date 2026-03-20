type CenterTemplateData = {
  title?: string;
  subtitle?: string;
  icon?: string;
};

export default function centerTemplateMock({ title, subtitle, icon }: CenterTemplateData) {
  return [
    '<div class="ccm-center">',
    icon ? `<img src="${icon}" alt="icon">` : '',
    title ? `<h3>${title}</h3>` : '',
    subtitle ? `<p>${subtitle}</p>` : '',
    '</div>',
  ].join('');
}
