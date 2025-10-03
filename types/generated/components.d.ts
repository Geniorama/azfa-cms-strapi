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

export interface ComponentsContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_components_contact_infos';
  info: {
    description: 'Informaci\u00F3n de contacto con logo y datos';
    displayName: 'Contact Info';
  };
  attributes: {
    ctaText: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Cont\u00E1ctanos para m\u00E1s informaci\u00F3n sobre nuestros servicios'>;
    logo: Schema.Attribute.Media<'images'>;
    showContactInfo: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
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
    developedByLink: Schema.Attribute.Component<'components.link', false>;
    developedByText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Realizado por'>;
    legalLinks: Schema.Attribute.Component<'components.link', true>;
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

export interface ComponentsCtaSection extends Struct.ComponentSchema {
  collectionName: 'components_components_cta_sections';
  info: {
    description: 'Secci\u00F3n simple con t\u00EDtulo, descripci\u00F3n y bot\u00F3n';
    displayName: 'CTA Section';
  };
  attributes: {
    button: Schema.Attribute.Component<'components.simple-button', false> &
      Schema.Attribute.Required;
    description: Schema.Attribute.RichText & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsEventsTabConfig extends Struct.ComponentSchema {
  collectionName: 'components_components_events_tab_configs';
  info: {
    description: 'Configuraci\u00F3n para pesta\u00F1as de eventos (todos, pr\u00F3ximos, pasados)';
    displayName: 'Events Tab Config';
  };
  attributes: {
    featuredEvents: Schema.Attribute.Relation<'oneToMany', 'api::event.event'>;
    featuredSectionTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Eventos Destacados'>;
    showFeaturedSection: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    tabLabel: Schema.Attribute.String & Schema.Attribute.Required;
    tabSlug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsFooterLinks extends Struct.ComponentSchema {
  collectionName: 'components_components_footer_links';
  info: {
    description: 'Secci\u00F3n de enlaces del footer con t\u00EDtulo';
    displayName: 'Footer Links';
  };
  attributes: {
    links: Schema.Attribute.Component<'components.link', true>;
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

export interface ComponentsHeroIconLink extends Struct.ComponentSchema {
  collectionName: 'components_components_hero_icon_links';
  info: {
    description: 'Icon with label and URL for hero sections';
    displayName: 'Hero Icon Link';
  };
  attributes: {
    icon: Schema.Attribute.Component<'components.icon', false>;
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
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
    src: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsIframeCollection extends Struct.ComponentSchema {
  collectionName: 'components_components_iframe_collections';
  info: {
    description: 'Collection of iframes with desktop and mobile versions. Slug should be unique (e.g., statistics-dashboard)';
    displayName: 'Iframe Collection';
  };
  attributes: {
    desktopIframe: Schema.Attribute.Component<'components.iframe', false> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    mobileIframe: Schema.Attribute.Component<'components.iframe', false>;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsIncentiveItem extends Struct.ComponentSchema {
  collectionName: 'components_components_incentive_items';
  info: {
    displayName: 'Incentive Item';
    icon: 'bulletList';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    label: Schema.Attribute.String;
  };
}

export interface ComponentsItemList extends Struct.ComponentSchema {
  collectionName: 'components_components_item_lists';
  info: {
    displayName: 'ItemList';
    icon: 'check';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface ComponentsLeaderProfile extends Struct.ComponentSchema {
  collectionName: 'components_components_leader_profiles';
  info: {
    displayName: 'profile';
    icon: 'crown';
  };
  attributes: {
    fullName: Schema.Attribute.String;
    photo: Schema.Attribute.Media<'images'>;
  };
}

export interface ComponentsLink extends Struct.ComponentSchema {
  collectionName: 'components_components_links';
  info: {
    description: 'Enlace simple para navegaci\u00F3n';
    displayName: 'Link';
  };
  attributes: {
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsLogoItem extends Struct.ComponentSchema {
  collectionName: 'components_components_logo_items';
  info: {
    description: 'Individual logo with image, name and optional link';
    displayName: 'Logo Item';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    url: Schema.Attribute.String;
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

export interface ComponentsServiceItem extends Struct.ComponentSchema {
  collectionName: 'components_components_service_items';
  info: {
    description: 'Individual service with tag, title and button';
    displayName: 'Service Item';
  };
  attributes: {
    button: Schema.Attribute.Component<'components.button', false>;
    coverImage: Schema.Attribute.Media<'images'>;
    tag: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ComponentsSimpleButton extends Struct.ComponentSchema {
  collectionName: 'components_components_simple_buttons';
  info: {
    description: 'Bot\u00F3n simple con solo label y URL';
    displayName: 'Simple Button';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
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
    icon: Schema.Attribute.Component<'components.icon', false> &
      Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
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

export interface ComponentsSocialWidget extends Struct.ComponentSchema {
  collectionName: 'components_components_social_widgets';
  info: {
    description: 'Widget for social media embeds (LinkedIn, X, Instagram, etc.)';
    displayName: 'Social Widget';
  };
  attributes: {
    embedCode: Schema.Attribute.Text;
    platform: Schema.Attribute.Enumeration<
      ['linkedin', 'x-twitter', 'instagram', 'facebook', 'youtube', 'custom']
    >;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
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

export interface ComponentsTabItem extends Struct.ComponentSchema {
  collectionName: 'components_components_tab_items';
  info: {
    description: 'Individual tab with icon and label';
    displayName: 'Tab Item';
  };
  attributes: {
    icon: Schema.Attribute.Component<'components.icon', false>;
    label: Schema.Attribute.String;
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

export interface ComponentsViewAllLink extends Struct.ComponentSchema {
  collectionName: 'components_components_view_all_links';
  info: {
    description: "Link component with label and URL for 'View All' type links";
    displayName: 'View All Link';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
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

export interface SectionsComissionSectionItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_comission_section_items';
  info: {
    displayName: 'Comission section item';
    icon: 'user';
  };
  attributes: {
    coverImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.RichText;
    leaderProfiles: Schema.Attribute.Component<
      'components.leader-profile',
      true
    >;
    leadersLabel: Schema.Attribute.String;
    leadersText: Schema.Attribute.String;
    teamLabel: Schema.Attribute.String;
    teamProfiles: Schema.Attribute.Component<'components.leader-profile', true>;
    teamText: Schema.Attribute.String;
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
    address: Schema.Attribute.Text;
    addressIcon: Schema.Attribute.Component<'components.icon', false>;
    email: Schema.Attribute.String;
    emailIcon: Schema.Attribute.Component<'components.icon', false>;
    fullName: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    phoneIcon: Schema.Attribute.Component<'components.icon', false>;
    position: Schema.Attribute.String;
    website: Schema.Attribute.String;
  };
}

export interface SectionsContent extends Struct.ComponentSchema {
  collectionName: 'components_sections_contents';
  info: {
    displayName: 'content';
    icon: 'bulletList';
  };
  attributes: {
    button: Schema.Attribute.Component<'components.button', false>;
    coverImage: Schema.Attribute.Media<'images'>;
    description: Schema.Attribute.RichText;
    orderReverse: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    style: Schema.Attribute.Enumeration<['style-1', 'style-2']>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsContentWithVideo extends Struct.ComponentSchema {
  collectionName: 'components_sections_content_with_videos';
  info: {
    description: 'Section with icon, description, YouTube video and rich text content';
    displayName: 'Content with Video';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    video: Schema.Attribute.Component<'components.video', false>;
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
    contactInfo: Schema.Attribute.Component<'components.contact-info', false> &
      Schema.Attribute.Required;
    copyright: Schema.Attribute.Component<'components.copyright', false> &
      Schema.Attribute.Required;
    footerLinksColumns: Schema.Attribute.Component<
      'components.footer-links',
      true
    >;
    showSocialLinks: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsHeader extends Struct.ComponentSchema {
  collectionName: 'components_sections_headers';
  info: {
    description: 'Header global del sitio web';
    displayName: 'Header';
  };
  attributes: {
    availableLanguages: Schema.Attribute.Component<'components.option', true>;
    languageSelector: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    logoUrl: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/'>;
    mainMenu: Schema.Attribute.Component<'components.menu-item', true>;
    topButtons: Schema.Attribute.Component<'components.link', true>;
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

export interface SectionsHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_slides';
  info: {
    description: 'Hero section slide with background, text, button and icon links';
    displayName: 'Hero Slide';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    button: Schema.Attribute.Component<'components.button', false>;
    iconLinks: Schema.Attribute.Component<'components.hero-icon-link', true>;
    label: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsIconContentSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_icon_content_sections';
  info: {
    description: 'Section with icon and rich text content';
    displayName: 'Icon Content Section';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    icon: Schema.Attribute.Component<'components.icon', false>;
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

export interface SectionsLogosSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_logos_sections';
  info: {
    description: 'Reusable section for displaying logos (affiliates, partners, sponsors, etc.)';
    displayName: 'Logos Section';
  };
  attributes: {
    displayType: Schema.Attribute.Enumeration<['slider', 'grid']> &
      Schema.Attribute.DefaultTo<'slider'>;
    logos: Schema.Attribute.Component<'components.logo-item', true>;
    title: Schema.Attribute.String;
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

export interface SectionsNewsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_news_sections';
  info: {
    description: 'Section to display news with title and view all link';
    displayName: 'News Section';
  };
  attributes: {
    title: Schema.Attribute.String;
    viewAllLink: Schema.Attribute.Component<'components.view-all-link', false>;
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

export interface SectionsServicesSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_services_sections';
  info: {
    description: 'Section with title and repeatable service items';
    displayName: 'Services Section';
  };
  attributes: {
    services: Schema.Attribute.Component<'components.service-item', true>;
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

export interface SectionsStatisticsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_statistics_sections';
  info: {
    description: 'Section with title and relation to statistics content type';
    displayName: 'Statistics Section';
  };
  attributes: {
    statistics: Schema.Attribute.Relation<
      'oneToMany',
      'api::statistic.statistic'
    >;
    title: Schema.Attribute.String;
  };
}

export interface SectionsTeamTabsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_team_tabs_sections';
  info: {
    description: 'Fixed tabs section for Board of Directors, Committees, and AZFA Team';
    displayName: 'Team Tabs Section';
  };
  attributes: {
    azfaTeamTab: Schema.Attribute.Component<'components.tab-item', false>;
    boardOfDirectorsTab: Schema.Attribute.Component<
      'components.tab-item',
      false
    >;
    committeesTab: Schema.Attribute.Component<'components.tab-item', false>;
  };
}

export interface SectionsTestimonialsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials_sections';
  info: {
    description: 'Section with label and title for testimonials display';
    displayName: 'Testimonials Section';
  };
  attributes: {
    label: Schema.Attribute.String;
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

export interface SectionsUpcomingEventsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_upcoming_events_sections';
  info: {
    description: 'Section to display upcoming events with title and view all link';
    displayName: 'Upcoming Events Section';
  };
  attributes: {
    title: Schema.Attribute.String;
    viewAllLink: Schema.Attribute.Component<'components.view-all-link', false>;
  };
}

export interface SectionsWidgetsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_widgets_sections';
  info: {
    description: 'Section with social media widgets (LinkedIn, X, Instagram, etc.)';
    displayName: 'Widgets Section';
  };
  attributes: {
    title: Schema.Attribute.String;
    widgets: Schema.Attribute.Component<'components.social-widget', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.button': ComponentsButton;
      'components.contact-info': ComponentsContactInfo;
      'components.copyright': ComponentsCopyright;
      'components.counter': ComponentsCounter;
      'components.cta-section': ComponentsCtaSection;
      'components.events-tab-config': ComponentsEventsTabConfig;
      'components.footer-links': ComponentsFooterLinks;
      'components.gallery': ComponentsGallery;
      'components.gm-location': ComponentsGmLocation;
      'components.heading-list': ComponentsHeadingList;
      'components.hero-icon-link': ComponentsHeroIconLink;
      'components.icon': ComponentsIcon;
      'components.iframe': ComponentsIframe;
      'components.iframe-collection': ComponentsIframeCollection;
      'components.incentive-item': ComponentsIncentiveItem;
      'components.item-list': ComponentsItemList;
      'components.leader-profile': ComponentsLeaderProfile;
      'components.link': ComponentsLink;
      'components.logo-item': ComponentsLogoItem;
      'components.menu-item': ComponentsMenuItem;
      'components.option': ComponentsOption;
      'components.service-item': ComponentsServiceItem;
      'components.simple-button': ComponentsSimpleButton;
      'components.slider': ComponentsSlider;
      'components.social-media-link': ComponentsSocialMediaLink;
      'components.social-media-section': ComponentsSocialMediaSection;
      'components.social-widget': ComponentsSocialWidget;
      'components.submenu-item': ComponentsSubmenuItem;
      'components.tab-item': ComponentsTabItem;
      'components.table-list': ComponentsTableList;
      'components.tag': ComponentsTag;
      'components.video': ComponentsVideo;
      'components.view-all-link': ComponentsViewAllLink;
      'sections.call-to-action': SectionsCallToAction;
      'sections.comission-section-item': SectionsComissionSectionItem;
      'sections.contact': SectionsContact;
      'sections.content': SectionsContent;
      'sections.content-with-video': SectionsContentWithVideo;
      'sections.counters': SectionsCounters;
      'sections.download': SectionsDownload;
      'sections.events-grid': SectionsEventsGrid;
      'sections.footer': SectionsFooter;
      'sections.header': SectionsHeader;
      'sections.heading': SectionsHeading;
      'sections.hero-slide': SectionsHeroSlide;
      'sections.icon-content-section': SectionsIconContentSection;
      'sections.intro': SectionsIntro;
      'sections.list': SectionsList;
      'sections.logos-section': SectionsLogosSection;
      'sections.news-grid': SectionsNewsGrid;
      'sections.news-section': SectionsNewsSection;
      'sections.seo': SectionsSeo;
      'sections.services-grid': SectionsServicesGrid;
      'sections.services-section': SectionsServicesSection;
      'sections.slider': SectionsSlider;
      'sections.slider-testimonials': SectionsSliderTestimonials;
      'sections.statistics-section': SectionsStatisticsSection;
      'sections.team-tabs-section': SectionsTeamTabsSection;
      'sections.testimonials-section': SectionsTestimonialsSection;
      'sections.two-columns-section': SectionsTwoColumnsSection;
      'sections.upcoming-events-section': SectionsUpcomingEventsSection;
      'sections.widgets-section': SectionsWidgetsSection;
    }
  }
}
