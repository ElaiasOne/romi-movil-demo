<template>
    <ion-page>
        <ion-header>
      <Toolbar />
    </ion-header>
      <ion-content class="ion-padding">
        <!-- Top: título + buscador -->
        <div class="header-row">
          <h2 class="title">Artículos</h2>
          <ion-searchbar
            v-model="q"
            placeholder="Buscar por descripción o código…"
            debounce="250"
            class="search"
          />
        </div>
  
        <!-- Filtros -->
        <ion-segment v-model="filtro" value="activos" class="segment">
          <ion-segment-button value="activos">
            <ion-label>Activos</ion-label>
          </ion-segment-button>
          <ion-segment-button value="todos">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
        </ion-segment>
  
        <!-- Skeleton (simula carga) -->
        <div v-if="loading" class="grid">
          <ion-card v-for="i in 6" :key="i" class="card">
            <ion-card-header>
              <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
              <ion-skeleton-text animated style="width: 40%; margin-top: 6px"></ion-skeleton-text>
            </ion-card-header>
            <ion-card-content>
              <ion-skeleton-text animated style="width: 90%"></ion-skeleton-text>
              <ion-skeleton-text animated style="width: 70%; margin-top: 6px"></ion-skeleton-text>
            </ion-card-content>
          </ion-card>
        </div>
  
        <!-- Listado -->
        <div v-else class="grid">
          <ion-card v-for="a in filtrados" :key="a.id" class="card">
            <ion-card-header>
              <div class="card-header">
                <div class="card-title">
                  <strong>{{ a.descripcion }}</strong>
                  <ion-badge :color="a.activo ? 'success' : 'medium'">{{ a.activo ? 'Activo' : 'Inactivo' }}</ion-badge>
                </div>
                <small class="muted">Int: {{ a.codigointerno }} · EAN: {{ a.ean || '-' }}</small>
              </div>
            </ion-card-header>
  
            <ion-card-content>
              <div class="prices">
                <div>
                  <span class="label">Venta</span>
                  <div class="price venta">${{ a.precioventa.toFixed(2) }}</div>
                </div>
                <div>
                  <span class="label">Costo</span>
                  <div class="price costo">${{ a.preciocosto.toFixed(2) }}</div>
                </div>
                <div>
                  <span class="label">Stock</span>
                  <div class="stock">{{ a.stock ?? 0 }}</div>
                </div>
              </div>
  
              <div class="actions">
                <ion-button size="small" fill="solid" @click="goEdit(a.id)">Editar</ion-button>
                <ion-button size="small" fill="outline" color="medium" @click="toggleActivo(a)">
                  {{ a.activo ? 'Desactivar' : 'Activar' }}
                </ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="remove(a.id)">Eliminar</ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
  
        <!-- Estado vacío -->
        <div v-if="!loading && filtrados.length === 0" class="empty">
          <ion-icon name="pricetags-outline" class="empty-icon" />
          <p>No hay artículos que coincidan.</p>
          <ion-button size="default" onClick="window.location.href='/app/articulo/new'">Crear artículo</ion-button>
        </div>
  
        <!-- FAB -->
        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
          <ion-fab-button @click="goNew">
            <ion-icon name="add" />
          </ion-fab-button>
        </ion-fab>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardContent, IonBadge, IonButton,
    IonSkeletonText, IonFab, IonFabButton, IonIcon
  } from '@ionic/vue'
  
  type Articulo = {
    id: string
    codigointerno: string
    ean?: string
    descripcion: string
    preciocosto: number
    precioventa: number
    stock?: number
    activo: boolean
    creadoEl: string
  }
  
  // —— demo store local (localStorage). Si ya tenés services/db.ts, reemplazá estas funcs por las tuyas:
  const KEY = 'romi_articulos'
  const getList = (): Articulo[] => JSON.parse(localStorage.getItem(KEY) || '[]')
  const setList = (arr: Articulo[]) => localStorage.setItem(KEY, JSON.stringify(arr))
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
  
  const router = useRouter()
  const loading = ref(true)
  const q = ref('')
  const filtro = ref<'activos' | 'todos'>('activos')
  const list = ref<Articulo[]>([])
  
  function seedIfEmpty() {
    if (getList().length === 0) {
      const seed: Articulo[] = [
        { id: uuid(), codigointerno:'A001', ean:'779000000001', descripcion:'Lapicera ROMI Azul', preciocosto: 100, precioventa: 150, stock: 50, activo: true, creadoEl: new Date().toISOString() },
        { id: uuid(), codigointerno:'A002', ean:'779000000002', descripcion:'Cuaderno A5',       preciocosto: 800, precioventa:1200, stock: 20, activo: true, creadoEl: new Date().toISOString() },
        { id: uuid(), codigointerno:'A003', ean:'',             descripcion:'Regla 30cm',        preciocosto: 300, precioventa: 500, stock:  8, activo: false,creadoEl: new Date().toISOString() },
      ]
      setList(seed)
    }
  }
  
  function load() {
    list.value = getList()
  }
  
  function goNew() {
    router.push('/app/articulo/new')
  }
  
  function goEdit(id: string) {
    router.push(`/app/articulo/${id}`)
  }
  
  function remove(id: string) {
    const ok = confirm('¿Eliminar artículo? Esta acción no se puede deshacer.')
    if (!ok) return
    setList(getList().filter(a => a.id !== id))
    load()
  }
  
  function toggleActivo(a: Articulo) {
    const arr = getList()
    const i = arr.findIndex(x => x.id === a.id)
    if (i > -1) {
      arr[i].activo = !arr[i].activo
      setList(arr)
      load()
    }
  }
  
  const filtrados = computed(() => {
    const term = q.value.trim().toLowerCase()
    const items = list.value.filter(a => {
      const txt = (a.descripcion + ' ' + a.codigointerno).toLowerCase()
      const match = term === '' || txt.includes(term)
      const act = filtro.value === 'todos' ? true : a.activo
      return match && act
    })
    // orden sencillo: activos primero, luego por descripción
    return items.sort((x,y) => Number(y.activo) - Number(x.activo) || x.descripcion.localeCompare(y.descripcion))
  })
  
  onMounted(() => {
    seedIfEmpty()
    load()
    setTimeout(() => (loading.value = false), 400) // simula carga
  })
  </script>
  
  <style scoped>
  .title {
    margin: 0 0 6px 0;
    font-weight: 700;
  }
  .header-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  @media (min-width: 520px) {
    .header-row { grid-template-columns: minmax(140px, 280px) 1fr; align-items: end; }
    .search { margin-left: auto; }
  }
  
  .segment { margin: 6px 0 12px; }
  
  .grid {
    display: grid;
    gap: 12px;
  }
  @media (min-width: 720px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
  }
  
  .card { border-radius: 16px; overflow: hidden; }
  .card-header { display: flex; flex-direction: column; gap: 6px; }
  .card-title { display: flex; gap: 8px; align-items: center; }
  .muted { color: rgba(0,0,0,.55); }
  
  .prices {
    display: grid;
    grid-template-columns: repeat(3, minmax(90px, 1fr));
    gap: 12px;
    margin-bottom: 8px;
  }
  .label { font-size: 12px; color: rgba(0,0,0,.55); }
  .price { font-size: 18px; font-weight: 700; line-height: 1.1; }
  .venta { color: var(--ion-color-primary); }
  .costo { color: #666; }
  .stock { font-size: 16px; font-weight: 600; }
  
  .actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  .empty {
    margin-top: 32px;
    display: grid;
    place-items: center;
    gap: 12px;
    text-align: center;
    color: rgba(0,0,0,.6);
  }
  .empty-icon {
    font-size: 36px;
    opacity: .5;
  }
  </style>
  