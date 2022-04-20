const entite = {
  name: "entite",
  label: "Tercero",
  fields: [
    {
      property: "_id",
      label: "id",
    },
    {
      property: "names",
      label: "Nombres",
      type: "text",
    },
    {
      property: "idnumber",
      label: "Documento identidad",
      type: "text",
    },
    {
      property: "iddigit",
      label: "Tipo de documento",
      type: "text",
    },
    {
      property: "address",
      label: "Direccion",
      type: "text",
    },
    {
      property: "city",
      label: "Ciudad",
      type: "text",
    },
    {
      property: "phone",
      label: "Numero celular / telefono",
      type: "text",
    },
    {
      property: "email",
      label: "Email",
      type: "email",
    },
    {
      property: "entType",
      label: "Tipo de tercero",
      type: "text",
    },
    {
      property: "state",
      label: "Estado",
      type: "text",
    },
  ],
};

const place = {
  name: "place",
  label: "Lugar",
  fields: [
    {
      property: "_id",
      label: "id",
    },
    {
      property: "name",
      label: "Nombre",
      type: "text",
    },
    {
      property: "ownerId",
      label: "Propietario",
      relation: {
        from: "entite",
        foreign: "_id",
      },
    },
    {
      property: "contactId",
      label: "Contacto",
      relation: {
        from: "entite",
        foreign: "_id",
      },
    },
    {
      property: "address",
      label: "Direccion",
      type: "text",
    },
    {
      property: "city",
      label: "Ciudad",
      type: "text",
    },
    {
      property: "phone",
      label: "Telefono",
      type: "text",
    },
    {
      property: "state",
      label: "Estado",
      type: "text",
    },
  ],
};

const product = {
  name: "product",
  label: "Producto",
  fields: [
    {
      property: "_id",
      label: "id",
    },
    {
      property: "name",
      label: "Nombre",
      type: "text",
    },
    {
      property: "code",
      label: "Código",
      type: "text",
    },
    {
      property: "clase",
      label: "Clase",
      type: "text",
    },
    {
      property: "type",
      label: "Tipo",
      type: "text",
    },
    {
      property: "uniteId",
      label: "Unidad",
      relation: {
        from: "unite",
        foreign: "_id",
      },
    },
    {
      property: "weigthxpack",
      label: "Peso por paquete",
      type: "number",
    },
    {
      property: "unitxpack",
      label: "Unidad por paquete",
      type: "number",
    },
    {
      property: "description",
      label: "Descripcion",
      type: "text",
    },
  ],
};

const lote = {
  name: "lot",
  label: "Lote",
  fields: [
    {
      property: "_id",
      label: "id",
    },
    {
      property: "receivedAt",
      label: "Fecha de recepción",
      type: "date",
    },
    {
      property: "placeId",
      label: "Lugar de recepción",
      relation: {
        from: "place",
        foreign: "_id",
      },
    },
    {
      property: "code",
      label: "Código Lote",
      type: "text",
    },
    {
      property: "providerId",
      label: "Proveedor",
      relation: {
        from: "entite",
        foreign: "_id",
      },
    },
    {
      property: "state",
      label: "Estado",
      type: "text",
    },
  ],
};

const subLote = {
  name: "subLot",
  label: "Sub-Lote",
  fields: [
    {
      property: "_id",
      label: "id",
    },
    {
      property: "lotCode",
      label: "Código lote",
      type: "text",
    },
    {
      property: "descripcion",
      label: "Descripción",
      type: "text",
    },
    {
      property: "initialW",
      label: "Peso de registro",
      type: "number",
    },
    {
      property: "actualW",
      label: "Peso actual",
      type: "number",
    },
    {
      property: "finalW",
      label: "Peso final",
      type: "number",
    },
    {
      property: "uniteId",
      label: "Unidad medida",
      relation: {
        from: "unite",
        foreign: "_id",
      },
    },
    {
      property: "state",
      label: "Estado del lote",
      type: "text",
    },
  ],
};

const order = {
  name: "order",
  label: "Pedidos",
  fields: [
    {
      property: "code",
      label: "Código pedido",
      type: "text",
    },
    {
      property: "orderDate",
      label: "Fecha del pedido",
      type: "date",
    },
    {
      property: "address",
      label: "Dirección del pedido",
      type: "text",
    },
    {
      property: "description",
      label: "Descripción del pedido",
      type: "text",
    },
    {
      property: "customerId",
      label: "Cliente del pedido",
      relation: {
        from: "entite",
        foreign: "_id",
      },
    },
    {
      property: "state",
      label: "Estado del pedido",
      type: "text",
    },
  ],
};

const mix = {
  name: "mix",
  label: "Mezcla",
  fields: [
    {
      property: "uniteId",
      label: "unidad",
      relation: {
        from: "unite",
        foreign: "_id",
      },
    },
    {
      property: "code",
      label: "Código Mezcla",
      type: "text",
    },
    {
      property: "initialW",
      label: "Peso / Volumen",
      type: "number",
    },
    {
      property: "netW",
      label: "Peso / Volumen - neto",
      type: "number",
    },
    {
      property: "grossW",
      label: "Peso / Volumen - bruto",
      type: "number",
    },
    {
      property: "description",
      label: "Descripción Refinación",
      type: "text",
    },
    {
      property: "state",
      label: "Estado de la Mezcla",
      type: "text",
    },
  ],
};

const finalProd = {
  name: "refine",
  label: "Procesado",
  fields: [
    {
      property: "uniteId",
      label: "unidad",
      relation: {
        from: "unite",
        foreign: "_id",
      },
    },
    {
      property: "code",
      label: "Código procesado",
      type: "text",
    },
    {
      property: "lotCode",
      label: "Código Procesado final",
      type: "text",
    },
    {
      property: "name",
      label: "Nombre Procesado",
      type: "text",
    },
    {
      property: "unites",
      label: "Unidades producidas",
      type: "number",
    },
    {
      property: "uniteW",
      label: "Peso / Volumen de la unidad",
      type: "number",
    },
    {
      property: "netW",
      label: "Peso / Volumen - neto",
      type: "number",
    },
    {
      property: "grossW",
      label: "Peso / Volumen - bruto",
      type: "number",
    },
    {
      property: "description",
      label: "Descripción del procesado",
      type: "text",
    },
    {
      property: "state",
      label: "Estado del Procesado",
      type: "text",
    },
  ],
};

module.exports = {
  defaultSchemmas: [
    entite,
    place,
    product,
    subLote,
    lote,
    mix,
    finalProd,
    order,
  ],
};
