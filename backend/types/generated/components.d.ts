import type { Schema, Struct } from '@strapi/strapi';

export interface LinksProductionLink extends Struct.ComponentSchema {
  collectionName: 'components_links_production_links';
  info: {
    displayName: 'ProductionLink';
  };
  attributes: {
    production: Schema.Attribute.Relation<
      'oneToOne',
      'api::production.production'
    >;
  };
}

export interface LinksSoloLink extends Struct.ComponentSchema {
  collectionName: 'components_links_solo_links';
  info: {
    displayName: 'SoloLink';
  };
  attributes: {
    solo: Schema.Attribute.Relation<'oneToOne', 'api::solo.solo'>;
  };
}

export interface TicketTiersTicketTier extends Struct.ComponentSchema {
  collectionName: 'components_ticket_tiers_ticket_tiers';
  info: {
    displayName: 'TicketTier';
  };
  attributes: {
    capacity: Schema.Attribute.Integer;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.Decimal & Schema.Attribute.Required;
    tickets_sold: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'links.production-link': LinksProductionLink;
      'links.solo-link': LinksSoloLink;
      'ticket-tiers.ticket-tier': TicketTiersTicketTier;
    }
  }
}
