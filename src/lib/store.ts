"use client"
import { useState, useEffect, useCallback } from "react"

export type AppointmentType = "recorrido" | "llamada" | "reunion"
export type AppointmentStatus = "pendiente" | "realizada" | "cancelada"

export interface Appointment {
  id: string
  propertyId: string
  propertyAddress: string
  ownerPhone: string
  type: AppointmentType
  scheduledFor: string   // ISO date string "YYYY-MM-DD"
  scheduledTime: string  // "HH:MM"
  status: AppointmentStatus
  notes: string
  source?: "captura_rapida"
  lat?: number
  lng?: number
  createdAt: string
}

export type PropertyStatus = "en_venta" | "en_renta" | "separada" | "vendida"
export type PropertyType = "casa" | "departamento" | "local" | "terreno" | "oficina"
export type PropertyOperation = "venta" | "renta"

export interface PropertyPhoto {
  id: string
  url: string
  label: string
  isCover: boolean
  sortOrder: number
}

export interface Property {
  id: string
  title: string
  type: PropertyType
  operation: PropertyOperation
  status: PropertyStatus
  active: boolean
  price: number
  address: string
  colony: string
  city: string
  bedrooms: number
  bathrooms: number
  sqm: number
  sqmLand?: number
  amenities?: string[]
  photos: PropertyPhoto[]
  description: string
  state?: string
  zipCode?: string
  lat?: number
  lng?: number
  createdAt: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  budget: { min: number; max: number }
  lookingFor: string
  assignedProperties: string[]
  favoriteProperty?: string
  propertyRatings?: Record<string, number>
  notes: string
  status: "activo" | "inactivo"
  createdAt: string
}

const DEMO_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Casa en Polanco",
    type: "casa",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 4_500_000,
    address: "Emilio Castelar 234",
    colony: "Polanco",
    city: "CDMX",
    bedrooms: 3,
    bathrooms: 2,
    sqm: 180,
    description: "Hermosa casa en Polanco con jardín y estacionamiento.",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "p2", url: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "p3", url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 2 },
      { id: "p4", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", label: "Recámara Principal", isCover: false, sortOrder: 3 },
      { id: "p5", url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80", label: "Baño", isCover: false, sortOrder: 4 },
      { id: "p6", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Jardín", isCover: false, sortOrder: 5 },
    ],
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    title: "Depto Santa Fe",
    type: "departamento",
    operation: "venta",
    status: "separada",
    active: true,
    price: 2_800_000,
    address: "Paseo de los Tamarindos 90",
    colony: "Santa Fe",
    city: "CDMX",
    bedrooms: 2,
    bathrooms: 1,
    sqm: 95,
    description: "Moderno departamento en Santa Fe, amenidades completas.",
    photos: [
      { id: "p7", url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "p8", url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "p9", url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-08",
  },
  {
    id: "3",
    title: "Local Condesa",
    type: "local",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 25_000,
    address: "Tamaulipas 45",
    colony: "Condesa",
    city: "CDMX",
    bedrooms: 0,
    bathrooms: 1,
    sqm: 120,
    description: "Local comercial en zona de alta afluencia.",
    photos: [
      { id: "p10", url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
    ],
    createdAt: "2026-03-05",
  },
  // San Pedro Garza García — datos de muestra
  {
    id: "sp1",
    title: "Casa en Valle Oriente",
    type: "casa",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 8_500_000,
    address: "Calzada del Valle 310",
    colony: "Valle Oriente",
    city: "San Pedro Garza García",
    bedrooms: 4,
    bathrooms: 3,
    sqm: 320,
    sqmLand: 480,
    amenities: ["Alberca", "Jardín", "Cochera", "Cuarto de servicio", "Seguridad 24h", "Terraza", "BBQ"],
    description: "Residencia de lujo en Valle Oriente con acabados de primera, jardín privado, alberca y cuarto de servicio. Seguridad 24h.",
    photos: [
      { id: "sp1a", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp1b", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp1c", url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 2 },
      { id: "sp1d", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Jardín / Alberca", isCover: false, sortOrder: 3 },
    ],
    createdAt: "2026-03-12",
  },
  {
    id: "sp2",
    title: "Casa en Fuente del Valle",
    type: "casa",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 5_900_000,
    address: "Av. Fuente de Vida 88",
    colony: "Fuente del Valle",
    city: "San Pedro Garza García",
    bedrooms: 3,
    bathrooms: 2,
    sqm: 240,
    sqmLand: 340,
    amenities: ["Jardín", "Terraza", "Cochera techada", "Seguridad 24h", "Cocina integral"],
    description: "Casa moderna en privada con vigilancia. Cocina integral, terraza y 2 lugares de estacionamiento techado.",
    photos: [
      { id: "sp2a", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp2b", url: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp2c", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", label: "Recámara Principal", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-11",
  },
  {
    id: "sp3",
    title: "Depto. en Vía Corso",
    type: "departamento",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 4_200_000,
    address: "Vía Corso 150 Torre B",
    colony: "Valle Oriente",
    city: "San Pedro Garza García",
    bedrooms: 2,
    bathrooms: 2,
    sqm: 115,
    amenities: ["Gimnasio", "Rooftop", "Concierge", "Elevador", "Vigilancia 24h"],
    description: "Departamento en torre de lujo, piso 8. Amenidades: gym, rooftop, lobby con concierge. Vista a la ciudad.",
    photos: [
      { id: "sp3a", url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp3b", url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp3c", url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-10",
  },
  {
    id: "sp4",
    title: "Casa en Del Valle",
    type: "casa",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 35_000,
    address: "Paseo de los Leones 560",
    colony: "Del Valle",
    city: "San Pedro Garza García",
    bedrooms: 3,
    bathrooms: 2,
    sqm: 210,
    sqmLand: 280,
    description: "Casa en renta en zona residencial tranquila. Jardín privado, cuarto de servicio, cocina equipada. Contrato mínimo 1 año.",
    photos: [
      { id: "sp4a", url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp4b", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Jardín", isCover: false, sortOrder: 1 },
    ],
    createdAt: "2026-03-09",
  },
  {
    id: "sp5",
    title: "Casa en Loma Larga",
    type: "casa",
    operation: "venta",
    status: "separada",
    active: true,
    price: 12_800_000,
    address: "Sierra Alta 1045",
    colony: "Loma Larga",
    city: "San Pedro Garza García",
    bedrooms: 5,
    bathrooms: 4,
    sqm: 520,
    sqmLand: 700,
    amenities: ["Alberca climatizada", "Cine privado", "Cava de vinos", "Jardín", "Cochera", "Cuarto de servicio", "Seguridad 24h", "BBQ"],
    description: "Residencia de alto lujo con vista panorámica al cerro. Cava de vinos, cine privado, alberca climatizada y caseta de vigilancia independiente.",
    photos: [
      { id: "sp5a", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp5b", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp5c", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Alberca", isCover: false, sortOrder: 2 },
      { id: "sp5d", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", label: "Recámara Principal", isCover: false, sortOrder: 3 },
    ],
    createdAt: "2026-03-08",
  },
  {
    id: "sp6",
    title: "Oficina en Corporativo Santa María",
    type: "oficina",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 55_000,
    address: "Blvd. Antonio L. Rodríguez 3000",
    colony: "Santa María",
    city: "San Pedro Garza García",
    bedrooms: 0,
    bathrooms: 2,
    sqm: 180,
    description: "Oficina corporativa en edificio clase A+. Piso 12, estacionamientos incluidos, sala de juntas, acceso biométrico.",
    photos: [
      { id: "sp6a", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp6b", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=80", label: "Interior", isCover: false, sortOrder: 1 },
    ],
    createdAt: "2026-03-07",
  },
  {
    id: "sp7",
    title: "Depto. en Cumbres Elite",
    type: "departamento",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 22_000,
    address: "Av. Cumbres 7mo Sector 415",
    colony: "Cumbres Elite",
    city: "San Pedro Garza García",
    bedrooms: 2,
    bathrooms: 1,
    sqm: 85,
    description: "Departamento amueblado disponible de inmediato. Estacionamiento subterráneo, área de lavandería, vigilancia 24h.",
    photos: [
      { id: "sp7a", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp7b", url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
    ],
    createdAt: "2026-03-06",
  },
  {
    id: "sp8",
    title: "Terreno en Carretera Nacional",
    type: "terreno",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 3_200_000,
    address: "Carretera Nacional Km 14.5",
    colony: "Hacienda El Rosario",
    city: "San Pedro Garza García",
    bedrooms: 0,
    bathrooms: 0,
    sqm: 0,
    sqmLand: 1_200,
    description: "Terreno plano con uso de suelo mixto. Excelente ubicación sobre vía principal. Ideal para desarrollo residencial o comercial.",
    photos: [
      { id: "sp8a", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", label: "Terreno", isCover: true, sortOrder: 0 },
    ],
    createdAt: "2026-03-05",
  },
  {
    id: "sp9",
    title: "Casa en Privada Altavista",
    type: "casa",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 6_750_000,
    address: "Altavista 22 Int. 8",
    colony: "Altavista",
    city: "San Pedro Garza García",
    bedrooms: 4,
    bathrooms: 3,
    sqm: 290,
    sqmLand: 390,
    amenities: ["BBQ", "Jardín", "Cochera", "Seguridad 24h", "Cocina con isla"],
    description: "Casa en privada de 12 unidades con acceso controlado. Recién remodelada, pisos de mármol, cocina con isla y área de BBQ.",
    photos: [
      { id: "sp9a", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp9b", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 1 },
      { id: "sp9c", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", label: "Recámara", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-04",
  },
  {
    id: "sp10",
    title: "Casa en El Ángel",
    type: "casa",
    operation: "venta",
    status: "vendida",
    active: true,
    price: 9_100_000,
    address: "Ángel de la Guarda 77",
    colony: "El Ángel",
    city: "San Pedro Garza García",
    bedrooms: 4,
    bathrooms: 4,
    sqm: 400,
    sqmLand: 550,
    description: "Residencia vendida. Casa esquinera con 4 recámaras en suite, estudio, sala de juegos, alberca y jardín amplio.",
    photos: [
      { id: "sp10a", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp10b", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Alberca", isCover: false, sortOrder: 1 },
    ],
    createdAt: "2026-02-28",
  },
  {
    id: "sp11",
    title: "Depto. en Distrito Cordillera",
    type: "departamento",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 5_300_000,
    address: "Cordillera de los Andes 150, Torre 3 Piso 14",
    colony: "Cordillera",
    city: "San Pedro Garza García",
    bedrooms: 3,
    bathrooms: 2,
    sqm: 140,
    amenities: ["Rooftop", "Gimnasio", "Alberca", "Concierge", "Vigilancia 24h", "Estacionamiento doble"],
    description: "Departamento de lujo en desarrollo nuevo, piso 14 con vista al cerro. Entrega inmediata, cocina alemana, clósets a medida.",
    photos: [
      { id: "sp11a", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp11b", url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp11c", url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80", label: "Cocina", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-14",
  },
  {
    id: "sp12",
    title: "Casa en Bosques del Valle",
    type: "casa",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 7_200_000,
    address: "Bosque de Cedros 38",
    colony: "Bosques del Valle",
    city: "San Pedro Garza García",
    bedrooms: 4,
    bathrooms: 3,
    sqm: 350,
    sqmLand: 460,
    amenities: ["Jardín", "Alberca", "Cochera", "BBQ", "Cuarto de servicio", "Seguridad 24h", "Estudio"],
    description: "Casa en privada arbolada, muy tranquila. 4 recámaras con walk-in closet, estudio, sala de TV, jardín con alberca y área de BBQ.",
    photos: [
      { id: "sp12a", url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp12b", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp12c", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", label: "Jardín / Alberca", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-13",
  },
  {
    id: "sp13",
    title: "Local en Plaza Fiesta San Agustín",
    type: "local",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 48_000,
    address: "Av. Gómez Morín 945 Local 112",
    colony: "San Agustín",
    city: "San Pedro Garza García",
    bedrooms: 0,
    bathrooms: 1,
    sqm: 90,
    description: "Local en plaza comercial de alto tráfico, frente a corredor principal. Ideal para moda, restaurante o servicios. Entrega en obra gris.",
    photos: [
      { id: "sp13a", url: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=400&q=80", label: "Fachada Plaza", isCover: true, sortOrder: 0 },
      { id: "sp13b", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", label: "Interior", isCover: false, sortOrder: 1 },
    ],
    createdAt: "2026-03-12",
  },
  {
    id: "sp14",
    title: "Casa en Colinas de San Agustín",
    type: "casa",
    operation: "renta",
    status: "en_renta",
    active: true,
    price: 42_000,
    address: "Colinas del Río 205",
    colony: "Colinas de San Agustín",
    city: "San Pedro Garza García",
    bedrooms: 3,
    bathrooms: 3,
    sqm: 260,
    sqmLand: 320,
    amenities: ["Jardín", "Cochera techada", "Cuarto de servicio", "Seguridad 24h", "Cocina integral"],
    description: "Casa en renta en coto privado. Amplia, luminosa, con jardín y área de lavandería. Disponible inmediatamente. Amueblada opcional.",
    photos: [
      { id: "sp14a", url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&q=80", label: "Fachada", isCover: true, sortOrder: 0 },
      { id: "sp14b", url: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&q=80", label: "Sala", isCover: false, sortOrder: 1 },
      { id: "sp14c", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80", label: "Recámara Principal", isCover: false, sortOrder: 2 },
    ],
    createdAt: "2026-03-11",
  },
  {
    id: "sp15",
    title: "Terreno en Rincón de San Jerónimo",
    type: "terreno",
    operation: "venta",
    status: "en_venta",
    active: true,
    price: 4_800_000,
    address: "Blvd. San Jerónimo Km 2.3",
    colony: "Rincón de San Jerónimo",
    city: "San Pedro Garza García",
    bedrooms: 0,
    bathrooms: 0,
    sqm: 0,
    sqmLand: 800,
    description: "Terreno en zona residencial de alta plusvalía, listo para construir. Escrituras al corriente, servicios al frente, uso de suelo habitacional.",
    photos: [
      { id: "sp15a", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80", label: "Terreno", isCover: true, sortOrder: 0 },
    ],
    createdAt: "2026-03-10",
  },
]

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    propertyId: "",
    propertyAddress: "Insurgentes Sur 1234, Del Valle",
    ownerPhone: "55-8765-4321",
    type: "llamada",
    scheduledFor: "2026-03-17",
    scheduledTime: "10:00",
    status: "pendiente",
    notes: "Número extraído del letrero. Casa en esquina con jardín.",
    createdAt: "2026-03-16",
  },
  {
    id: "a2",
    propertyId: "",
    propertyAddress: "Av. Revolución 567, San Ángel",
    ownerPhone: "55-2345-6789",
    type: "recorrido",
    scheduledFor: "2026-03-18",
    scheduledTime: "12:00",
    status: "pendiente",
    notes: "Edificio de 3 pisos. Posible exclusividad.",
    createdAt: "2026-03-16",
  },
]

const DEMO_LEADS: Lead[] = [
  {
    id: "1",
    name: "Ana García",
    phone: "55-1234-5678",
    email: "ana@email.com",
    budget: { min: 3_000_000, max: 5_000_000 },
    lookingFor: "Casa en Polanco o Lomas, 3+ rec",
    assignedProperties: ["1", "2"],
    favoriteProperty: "1",
    propertyRatings: { "1": 5, "2": 3 },
    notes: "Recorrido agendado para Mar 17",
    status: "activo",
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    name: "Roberto Mejía",
    phone: "55-9876-5432",
    email: "roberto@email.com",
    budget: { min: 20_000, max: 30_000 },
    lookingFor: "Local comercial Condesa o Roma",
    assignedProperties: ["3"],
    notes: "Muy interesado, lista para rentar en abril",
    status: "activo",
    createdAt: "2026-03-12",
  },
  {
    id: "3",
    name: "Sofía Montemayor",
    phone: "81-2345-6789",
    email: "sofia.montemayor@gmail.com",
    budget: { min: 5_000_000, max: 8_000_000 },
    lookingFor: "Casa en San Pedro, 4 rec, con jardín y alberca, privada",
    assignedProperties: ["sp1", "sp12", "sp9"],
    favoriteProperty: "sp12",
    propertyRatings: { "sp1": 4, "sp12": 5, "sp9": 3 },
    notes: "Ejecutiva de empresa regia. Mudanza desde CDMX. Necesita escuelas cercanas. Recorrido programado para fin de semana.",
    status: "activo",
    createdAt: "2026-03-15",
  },
  {
    id: "4",
    name: "Diego Treviño",
    phone: "81-8877-1122",
    email: "dtrevino@empresas.com",
    budget: { min: 40_000, max: 55_000 },
    lookingFor: "Oficina o local en zona corporativa San Pedro, 150-200 m²",
    assignedProperties: ["sp6", "sp13"],
    favoriteProperty: "sp6",
    propertyRatings: { "sp6": 5, "sp13": 4 },
    notes: "Despacho de abogados buscando nueva sede. Necesita sala de juntas y estacionamientos. Decisión en 2 semanas.",
    status: "activo",
    createdAt: "2026-03-16",
  },
  {
    id: "5",
    name: "Mariana Garza",
    phone: "81-5544-3322",
    email: "mgarza@hotmail.com",
    budget: { min: 18_000, max: 25_000 },
    lookingFor: "Casa o depto en renta San Pedro, 2-3 rec, amueblado si posible",
    assignedProperties: ["sp7", "sp14"],
    propertyRatings: { "sp7": 3, "sp14": 4 },
    notes: "Pareja joven, primer hogar. Prefieren Cumbres o San Agustín. Ya vieron sp7, les gustó sp14 pero quieren negociar precio.",
    status: "activo",
    createdAt: "2026-03-17",
  },
]

export interface AgentProfile {
  name: string
  phone: string
  email: string
  description: string
  photo?: string  // base64 data URL
}

const DEFAULT_PROFILE: AgentProfile = {
  name: "Carlos Ruiz",
  phone: "55-1234-5678",
  email: "carlos@agent4u.mx",
  description: "Agente inmobiliario con más de 10 años de experiencia en CDMX y área metropolitana.",
}

const PROFILE_KEY = "agent4u_profile"

export function useAgentProfile() {
  const [profile, setProfile] = useState<AgentProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (raw) setProfile(JSON.parse(raw))
    } catch {}
  }, [])

  const saveProfile = useCallback((p: AgentProfile) => {
    setProfile(p)
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    }
  }, [])

  return { profile, saveProfile }
}

const STORAGE_KEY = "agent4u_data"

function loadFromStorage() {
  if (typeof window === "undefined") return { properties: DEMO_PROPERTIES, leads: DEMO_LEADS, appointments: DEMO_APPOINTMENTS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...parsed, appointments: parsed.appointments ?? DEMO_APPOINTMENTS }
    }
  } catch {}
  return { properties: DEMO_PROPERTIES, leads: DEMO_LEADS, appointments: DEMO_APPOINTMENTS }
}

function saveToStorage(data: { properties: Property[]; leads: Lead[]; appointments: Appointment[] }) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useStore() {
  const [data, setData] = useState<{ properties: Property[]; leads: Lead[]; appointments: Appointment[] }>({
    properties: DEMO_PROPERTIES,
    leads: DEMO_LEADS,
    appointments: DEMO_APPOINTMENTS,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setData(loadFromStorage())
    setLoaded(true)
  }, [])

  const updateData = useCallback((next: { properties: Property[]; leads: Lead[]; appointments: Appointment[] }) => {
    setData(next)
    saveToStorage(next)
  }, [])

  const addProperty = useCallback((p: Property) => {
    setData(prev => {
      const next = { ...prev, properties: [p, ...prev.properties] }
      saveToStorage(next)
      return next
    })
  }, [])

  const updateProperty = useCallback((p: Property) => {
    setData(prev => {
      const next = { ...prev, properties: prev.properties.map(x => x.id === p.id ? p : x) }
      saveToStorage(next)
      return next
    })
  }, [])

  const addLead = useCallback((l: Lead) => {
    setData(prev => {
      const next = { ...prev, leads: [l, ...prev.leads] }
      saveToStorage(next)
      return next
    })
  }, [])

  const updateLead = useCallback((l: Lead) => {
    setData(prev => {
      const next = { ...prev, leads: prev.leads.map(x => x.id === l.id ? l : x) }
      saveToStorage(next)
      return next
    })
  }, [])

  const addAppointment = useCallback((a: Appointment) => {
    setData(prev => {
      const next = { ...prev, appointments: [a, ...prev.appointments] }
      saveToStorage(next)
      return next
    })
  }, [])

  const updateAppointment = useCallback((a: Appointment) => {
    setData(prev => {
      const next = { ...prev, appointments: prev.appointments.map(x => x.id === a.id ? a : x) }
      saveToStorage(next)
      return next
    })
  }, [])

  return {
    properties: data.properties,
    leads: data.leads,
    appointments: data.appointments,
    loaded,
    addProperty,
    updateProperty,
    addLead,
    updateLead,
    addAppointment,
    updateAppointment,
    updateData,
  }
}
