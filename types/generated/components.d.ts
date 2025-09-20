import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsButton extends Struct.ComponentSchema {
  collectionName: 'components_components_buttons';
  info: {
    displayName: 'Button';
    icon: 'link';
  };
  attributes: {
    link: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface ComponentsButtonLink extends Struct.ComponentSchema {
  collectionName: 'components_components_button_links';
  info: {
    description: 'Bot\u00F3n/enlace para navegaci\u00F3n con variantes de estilo';
    displayName: 'Button Link';
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'ghost']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface ComponentsContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_components_contact_infos';
  info: {
    description: 'Informaci\u00F3n de contacto con logo y datos';
    displayName: 'Contact Info';
  };
  attributes: {
    address: Schema.Attribute.Text;
    addressIcon: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'fa-map-marker-alt'>;
    ctaText: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Cont\u00E1ctanos para m\u00E1s informaci\u00F3n sobre nuestros servicios'>;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    emailIcon: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'fa-envelope'>;
    logo: Schema.Attribute.Media<'images'>;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
    phoneIcon: Schema.Attribute.String & Schema.Attribute.DefaultTo<'fa-phone'>;
  };
}

export interface ComponentsCopyright extends Struct.ComponentSchema {
  collectionName: 'components_components_copyrights';
  info: {
    description: 'Informaci\u00F3n de copyright y enlaces legales';
    displayName: 'Copyright';
  };
  attributes: {
    copyrightText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'\u00A9 2024 AZFA. Todos los derechos reservados.'>;
    developedByLink: Schema.Attribute.Component<
      'components.button-link',
      false
    >;
    developedByText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Realizado por'>;
    legalLinks: Schema.Attribute.Component<'components.button-link', true>;
  };
}

export interface ComponentsCounter extends Struct.ComponentSchema {
  collectionName: 'components_components_counters';
  info: {
    displayName: 'Counter';
    icon: 'arrowUp';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    label: Schema.Attribute.String;
    number: Schema.Attribute.Integer;
    prefix: Schema.Attribute.String;
    sufix: Schema.Attribute.String;
    timeRemaining: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface ComponentsFooterLinks extends Struct.ComponentSchema {
  collectionName: 'components_components_footer_links';
  info: {
    description: 'Secci\u00F3n de enlaces del footer con t\u00EDtulo';
    displayName: 'Footer Links';
  };
  attributes: {
    links: Schema.Attribute.Component<'components.button-link', true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsGallery extends Struct.ComponentSchema {
  collectionName: 'components_components_galleries';
  info: {
    displayName: 'Gallery';
    icon: 'apps';
  };
  attributes: {
    images: Schema.Attribute.Media<'images', true>;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsGmLocation extends Struct.ComponentSchema {
  collectionName: 'components_components_gm_locations';
  info: {
    displayName: 'GM Location';
    icon: 'pinMap';
  };
  attributes: {
    label: Schema.Attribute.String;
    latitude: Schema.Attribute.Float;
    longitude: Schema.Attribute.Float;
  };
}

export interface ComponentsHeadingList extends Struct.ComponentSchema {
  collectionName: 'components_components_heading_lists';
  info: {
    displayName: 'headingList';
    icon: 'bold';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsIcon extends Struct.ComponentSchema {
  collectionName: 'components_components_icons';
  info: {
    description: 'Icono con opci\u00F3n de react-icons o imagen personalizada';
    displayName: 'Icon';
  };
  attributes: {
    customImage: Schema.Attribute.Media<'images'>;
    reactIconName: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<['react-icon', 'custom-image']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'react-icon'>;
  };
}

export interface ComponentsIframe extends Struct.ComponentSchema {
  collectionName: 'components_components_iframes';
  info: {
    description: 'Componente simplificado para embeber contenido externo';
    displayName: 'Iframe';
  };
  attributes: {
    bottomText: Schema.Attribute.RichText;
    src: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsItemList extends Struct.ComponentSchema {
  collectionName: 'components_components_item_lists';
  info: {
    displayName: 'ItemList';
    icon: 'check';
  };
  attributes: {
    link: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface ComponentsLoginSection extends Struct.ComponentSchema {
  collectionName: 'components_components_login_sections';
  info: {
    description: 'Secci\u00F3n con texto informativo y bot\u00F3n de login/acceso';
    displayName: 'Login Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#f8f9fa'>;
    borderColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#e9ecef'>;
    buttonIcon: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'fa-arrow-right'>;
    buttonText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Iniciar sesi\u00F3n'>;
    buttonUrl: Schema.Attribute.String & Schema.Attribute.Required;
    buttonVariant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    description: Schema.Attribute.RichText & Schema.Attribute.Required;
    textColor: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#333333'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_components_menu_items';
  info: {
    description: 'Elemento de men\u00FA con soporte para submen\u00FAs';
    displayName: 'Menu Item';
  };
  attributes: {
    icon: Schema.Attribute.Component<'components.icon', false>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    submenu: Schema.Attribute.Component<'components.submenu-item', true>;
    url: Schema.Attribute.String;
  };
}

export interface ComponentsOption extends Struct.ComponentSchema {
  collectionName: 'components_components_options';
  info: {
    displayName: 'Option';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface ComponentsSlider extends Struct.ComponentSchema {
  collectionName: 'components_components_sliders';
  info: {
    displayName: 'Slide';
    icon: 'landscape';
  };
  attributes: {
    content: Schema.Attribute.Component<'sections.heading', false>;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsSocialMediaLink extends Struct.ComponentSchema {
  collectionName: 'components_components_social_media_links';
  info: {
    description: 'Enlace a redes sociales con icono';
    displayName: 'Social Media Link';
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#1877f2'>;
    icon: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    platform: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsSocialMediaSection extends Struct.ComponentSchema {
  collectionName: 'components_components_social_media_sections';
  info: {
    description: 'Secci\u00F3n de redes sociales con t\u00EDtulo y enlaces';
    displayName: 'Social Media Section';
  };
  attributes: {
    socialLinks: Schema.Attribute.Component<
      'components.social-media-link',
      true
    >;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'S\u00EDganos en nuestras redes sociales'>;
  };
}

export interface ComponentsSubmenuItem extends Struct.ComponentSchema {
  collectionName: 'components_components_submenu_items';
  info: {
    description: 'Elemento de submen\u00FA';
    displayName: 'Submenu Item';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String;
  };
}

export interface ComponentsTableList extends Struct.ComponentSchema {
  collectionName: 'components_components_table_lists';
  info: {
    displayName: 'tableList';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.Text;
  };
}

export interface ComponentsTag extends Struct.ComponentSchema {
  collectionName: 'components_components_tags';
  info: {
    description: 'Etiqueta o tag para categorizar contenido';
    displayName: 'Tag';
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#6366f1'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    slug: Schema.Attribute.UID<'name'>;
  };
}

export interface ComponentsVideo extends Struct.ComponentSchema {
  collectionName: 'components_components_videos';
  info: {
    displayName: 'Video';
    icon: 'play';
  };
  attributes: {
    autoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    loop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    muted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
    uploadedVideo: Schema.Attribute.Media<'videos'>;
    videoType: Schema.Attribute.Enumeration<['upload', 'youtube', 'vimeo']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'upload'>;
    vimeoUrl: Schema.Attribute.String;
    youtubeUrl: Schema.Attribute.String;
  };
}

export interface SectionsCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_sections_call_to_actions';
  info: {
    displayName: 'Call to action';
    icon: 'paperPlane';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface SectionsContact extends Struct.ComponentSchema {
  collectionName: 'components_sections_contacts';
  info: {
    displayName: 'Contact';
    icon: 'earth';
  };
  attributes: {
    email: Schema.Attribute.String;
    fullName: Schema.Attribute.String;
    position: Schema.Attribute.String;
    website: Schema.Attribute.String;
  };
}

export interface SectionsCounters extends Struct.ComponentSchema {
  collectionName: 'components_sections_counters';
  info: {
    displayName: 'Counters';
    icon: 'apps';
  };
  attributes: {
    counter: Schema.Attribute.Component<'components.counter', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsDownload extends Struct.ComponentSchema {
  collectionName: 'components_sections_downloads';
  info: {
    displayName: 'Download';
    icon: 'filePdf';
  };
  attributes: {
    cover: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    document: Schema.Attribute.Media<'files'> & Schema.Attribute.Required;
    target: Schema.Attribute.String;
    textButton: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsEventsGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_events_grids';
  info: {
    displayName: 'Events Grid';
    icon: 'apps';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFooter extends Struct.ComponentSchema {
  collectionName: 'components_sections_footers';
  info: {
    description: 'Footer global del sitio web';
    displayName: 'Footer';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#1a1a1a'>;
    contactInfo: Schema.Attribute.Component<'components.contact-info', false> &
      Schema.Attribute.Required;
    copyright: Schema.Attribute.Component<'components.copyright', false> &
      Schema.Attribute.Required;
    dividerColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#333333'>;
    footerLinksColumns: Schema.Attribute.Component<
      'components.footer-links',
      true
    >;
    socialMediaSection: Schema.Attribute.Component<
      'components.social-media-section',
      false
    > &
      Schema.Attribute.Required;
    textColor: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#ffffff'>;
  };
}

export interface SectionsHeader extends Struct.ComponentSchema {
  collectionName: 'components_sections_headers';
  info: {
    description: 'Header global del sitio web';
    displayName: 'Header';
  };
  attributes: {
    availableLanguages: Schema.Attribute.Component<
      'components.button-link',
      true
    >;
    backgroundColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#ffffff'>;
    languageSelector: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    logoUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/'>;
    mainMenu: Schema.Attribute.Component<'components.menu-item', true>;
    stickyHeader: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    textColor: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#000000'>;
    topButtons: Schema.Attribute.Component<'components.button-link', true>;
  };
}

export interface SectionsHeading extends Struct.ComponentSchema {
  collectionName: 'components_sections_headings';
  info: {
    displayName: 'Heading';
    icon: 'pin';
  };
  attributes: {
    alignment: Schema.Attribute.String;
    backgroundImg: Schema.Attribute.Media<'images'>;
    button: Schema.Attribute.Component<'components.button', false>;
    description: Schema.Attribute.Text;
    smallTitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsIntro extends Struct.ComponentSchema {
  collectionName: 'components_sections_intros';
  info: {
    displayName: 'Intro';
    icon: 'star';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    icon: Schema.Attribute.Media<'images'>;
  };
}

export interface SectionsList extends Struct.ComponentSchema {
  collectionName: 'components_sections_lists';
  info: {
    displayName: 'List';
    icon: 'bulletList';
  };
  attributes: {
    headingList: Schema.Attribute.Component<'components.heading-list', false>;
    items: Schema.Attribute.Component<'components.item-list', true>;
  };
}

export interface SectionsNewsGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_news_grids';
  info: {
    displayName: 'News Grid';
    icon: 'apps';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsSeo extends Struct.ComponentSchema {
  collectionName: 'components_sections_seos';
  info: {
    displayName: 'SEO';
    icon: 'crown';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text;
    metaKeywords: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface SectionsServicesGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_services_grids';
  info: {
    displayName: 'Services Grid';
    icon: 'apps';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_sliders';
  info: {
    displayName: 'Slider';
    icon: 'landscape';
  };
  attributes: {
    slides: Schema.Attribute.Component<'components.slider', true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsSliderTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_sections_slider_testimonials';
  info: {
    displayName: 'sliderTestimonials';
    icon: 'quote';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTwoColumnsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_two_columns_sections';
  info: {
    displayName: 'Two columns section';
    icon: 'dashboard';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    cover: Schema.Attribute.Media<'images'>;
    positionContent: Schema.Attribute.Enumeration<['left', 'right']>;
    title: Schema.Attribute.String;
    video: Schema.Attribute.Component<'components.video', false>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.button': ComponentsButton;
      'components.button-link': ComponentsButtonLink;
      'components.contact-info': ComponentsContactInfo;
      'components.copyright': ComponentsCopyright;
      'components.counter': ComponentsCounter;
      'components.footer-links': ComponentsFooterLinks;
      'components.gallery': ComponentsGallery;
      'components.gm-location': ComponentsGmLocation;
      'components.heading-list': ComponentsHeadingList;
      'components.icon': ComponentsIcon;
      'components.iframe': ComponentsIframe;
      'components.item-list': ComponentsItemList;
      'components.login-section': ComponentsLoginSection;
      'components.menu-item': ComponentsMenuItem;
      'components.option': ComponentsOption;
      'components.slider': ComponentsSlider;
      'components.social-media-link': ComponentsSocialMediaLink;
      'components.social-media-section': ComponentsSocialMediaSection;
      'components.submenu-item': ComponentsSubmenuItem;
      'components.table-list': ComponentsTableList;
      'components.tag': ComponentsTag;
      'components.video': ComponentsVideo;
      'sections.call-to-action': SectionsCallToAction;
      'sections.contact': SectionsContact;
      'sections.counters': SectionsCounters;
      'sections.download': SectionsDownload;
      'sections.events-grid': SectionsEventsGrid;
      'sections.footer': SectionsFooter;
      'sections.header': SectionsHeader;
      'sections.heading': SectionsHeading;
      'sections.intro': SectionsIntro;
      'sections.list': SectionsList;
      'sections.news-grid': SectionsNewsGrid;
      'sections.seo': SectionsSeo;
      'sections.services-grid': SectionsServicesGrid;
      'sections.slider': SectionsSlider;
      'sections.slider-testimonials': SectionsSliderTestimonials;
      'sections.two-columns-section': SectionsTwoColumnsSection;
    }
  }
}
