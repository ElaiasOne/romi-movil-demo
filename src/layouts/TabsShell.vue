<template>
  <ion-page>
    <!--<ion-header>
      <Toolbar />
    </ion-header>-->

    <ion-tabs>
      <ion-router-outlet />

      <ion-tab-bar slot="bottom" color="primary">
        <ion-tab-button tab="articulos" href="/app/articulos">
          <ion-icon name="pricetags-outline" />
          <ion-label>Artículos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="clientes" href="/app/clientes">
          <ion-icon name="people-outline" />
          <ion-label>Clientes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="estadisticos" href="/app/estadisticos">
          <ion-icon name="stats-chart-outline" />
          <ion-label>Estadísticos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="stock" href="/app/stock">
          <ion-icon name="cube-outline" />
          <ion-label>Stock</ion-label>
        </ion-tab-button>

        <!-- ...dentro de <ion-tab-bar> -->
<ion-tab-button tab="ventas" href="/app/ventas">
<ion-icon name="receipt-outline" />
<ion-label>Ventas</ion-label>
</ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import Toolbar from '@/components/Toolbar.vue'
import { IonPage, IonHeader, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue'
</script>
