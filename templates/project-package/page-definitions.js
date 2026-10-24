export const clientPageDefinitions = {
  admin: {
    basePath: '/admin',
    sections: [{ id: 'workspace', title: '工作區' }],
    pages: [
      {
        path: 'home',
        name: 'admin-home',
        title: '項目首頁',
        sourceType: 'html-template',
        source: 'home.html',
        fileName: 'home.html',
        section: 'workspace',
        icon: 'DataBoard',
      },
      // <generator:admin-pages>
    ],
  },
};
