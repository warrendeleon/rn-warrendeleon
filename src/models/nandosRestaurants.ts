export interface Restaurants {
  name: string;
  url: string;
  geo: {
    address: {
      streetAddress: string;
      addressLocality: string;
      postalCode: string;
    };
  };
}

export interface NandosDTO {
  data: {
    restaurant: {
      items: Restaurants[];
    };
  };
}
