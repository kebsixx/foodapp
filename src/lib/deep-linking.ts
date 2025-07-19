import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const config = {
  screens: {
    OrderDetail: {
      path: 'order/:id',
      parse: {
        id: (id: string) => id,
      },
    },
  },
};

export const linking = {
  prefixes: [prefix],
  config,
};