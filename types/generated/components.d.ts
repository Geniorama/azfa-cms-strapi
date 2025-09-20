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

export interface ComponentsIframe extends Struct.ComponentSchema {
  collectionName: 'components_components_iframes';
  info: {
    description: 'Componente para embeber contenido externo mediante iframe';
    displayName: 'Iframe';
  };
  attributes: {
    allowFullscreen: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    description: Schema.Attribute.Text;
    height: Schema.Attribute.String & Schema.Attribute.DefaultTo<'600px'>;
    loading: Schema.Attribute.Enumeration<['lazy', 'eager']> &
      Schema.Attribute.DefaultTo<'lazy'>;
    sandbox: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'allow-scripts allow-same-origin'>;
    src: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.String & Schema.Attribute.DefaultTo<'100%'>;
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
      'components.counter': ComponentsCounter;
      'components.gallery': ComponentsGallery;
      'components.gm-location': ComponentsGmLocation;
      'components.heading-list': ComponentsHeadingList;
      'components.iframe': ComponentsIframe;
      'components.item-list': ComponentsItemList;
      'components.option': ComponentsOption;
      'components.slider': ComponentsSlider;
      'components.table-list': ComponentsTableList;
      'components.video': ComponentsVideo;
      'sections.call-to-action': SectionsCallToAction;
      'sections.contact': SectionsContact;
      'sections.counters': SectionsCounters;
      'sections.download': SectionsDownload;
      'sections.events-grid': SectionsEventsGrid;
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
