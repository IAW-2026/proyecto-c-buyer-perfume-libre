// lib/data.ts
export interface Perfume {
  id: string;
  nombre: string;
  marca: string;
  tamaño: string;
  precio: number;
  imagenUrl: string;
}

// TODO: Reemplazar este mock por una llamada real a la api.
export const PERFUMES_MOCK: Perfume[] = [
  {
    id: "1",
    nombre: "Chanel No. 5 Eau de Parfum",
    marca: "Chanel",
    tamaño: "100 ml",
    precio: 145.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1769671327147-bb49bc45e9f6?q=80&w=777&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "2",
    nombre: "Dior Sauvage Eau de Toilette",
    precio: 98.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1700522604220-471669e4364c?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Dior",
    tamaño: "100 ml",
  },
  {
    id: "3",
    nombre: "Carolina Herrera Good Girl",
    precio: 112.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1458538977777-0549b2370168?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Carolina Herrera",
    tamaño: "80 ml",
  },
  {
    id: "4",
    nombre: "Paco Rabanne 1 Million",
    precio: 89.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1675255425189-ac9da0ae7d96?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Paco Rabanne",
    tamaño: "100 ml",
  },
  {
    id: "5",
    nombre: "Versace Bright Crystal",
    precio: 79.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Versace",
    tamaño: "90 ml",
  },
  {
    id: "6",
    nombre: "Hugo Boss Bottled",
    precio: 69.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1638551442447-085a2d42918f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Hugo Boss",
    tamaño: "100 ml",
  },
  {
    id: "7",
    nombre: "Lancôme La Vie Est Belle",
    precio: 105.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1613521140785-e85e427f8002?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Lancôme",
    tamaño: "75 ml",
  },
  {
    id: "8",
    nombre: "Calvin Klein CK One",
    precio: 45.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1620848616916-3efaf499adcb?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Calvin Klein",
    tamaño: "100 ml",
  },
  {
    id: "9",
    nombre: "Tom Ford Black Orchid",
    precio: 189.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1642698215110-87817f1fbe0e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Tom Ford",
    tamaño: "50 ml",
  },
  {
    id: "10",
    nombre: "Dolce & Gabbana Light Blue",
    precio: 84.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1720414913669-87031493d7c9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Dolce & Gabbana",
    tamaño: "100 ml",
  },
  {
    id: "11",
    nombre: "Yves Saint Laurent Libre",
    precio: 118.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1723391962166-6d9bb8a3d3e7?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "YSL",
    tamaño: "90 ml",
  },
  {
    id: "12",
    nombre: "Armani Code",
    precio: 92.99,
    imagenUrl:
      "https://images.unsplash.com/photo-1706924179763-7f2744656823?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    marca: "Armani",
    tamaño: "75 ml",
  },
];

// Función que simula una petición a la API con un poquito de demora
export async function getPerfumes(): Promise<Perfume[]> {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  return PERFUMES_MOCK;
}
