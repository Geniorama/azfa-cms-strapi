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

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.button': ComponentsButton;
      'components.gallery': ComponentsGallery;
      'components.gm-location': ComponentsGmLocation;
      'components.heading-list': ComponentsHeadingList;
      'components.item-list': ComponentsItemList;
      'components.option': ComponentsOption;
      'components.table-list': ComponentsTableList;
      'sections.call-to-action': SectionsCallToAction;
      'sections.contact': SectionsContact;
      'sections.download': SectionsDownload;
      'sections.heading': SectionsHeading;
      'sections.list': SectionsList;
      'sections.seo': SectionsSeo;
    }
  }
}
