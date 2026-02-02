"use server";

import { fetchApi } from "@/utils/api";
import {
  getStoresSyncHistory,
  getChannelsSyncHistory,
} from "@/components/sync/action";

export interface DashboardStats {
  totalProducts: number;
  connectedStores: number;
  totalPlatforms: number;
  pendingSyncs: number;
  lowStockItems: number;
  storeStatuses: Array<{
    name: string;
    status: "passed" | "failed";
  }>;
  channelStatuses: Array<{
    name: string;
    status: "passed" | "failed";
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch all required data in parallel
    const [
      productCountResponse,
      lowStockResponse,
      storesSyncHistory,
      channelsSyncHistory,
    ] = await Promise.all([
      fetchApi("/dashboard/product-count", {
        method: "GET",
        cache: "no-store",
      }),
      fetchApi("/dashboard/low-count", {
        method: "GET",
        cache: "no-store",
      }),
      getStoresSyncHistory(),
      getChannelsSyncHistory(),
    ]);

    // Process store statuses
    const storeStatuses = storesSyncHistory.data
      .filter((sync) => sync.isLatest && sync.store)
      .map((sync) => ({
        name: sync.store!.name,
        status: sync.status,
      }));

    // Process channel statuses
    const channelStatuses = channelsSyncHistory.data
      .filter((sync) => sync.isLatest && sync.channel)
      .map((sync) => ({
        name: sync.channel!.name,
        status: sync.status,
      }));

    // Count connected stores and total platforms
    const connectedStores = storeStatuses.filter(
      (store) => store.status === "passed"
    ).length;
    const totalPlatforms = storeStatuses.length;

    // Count connected channels
    const connectedChannels = channelStatuses.filter(
      (channel) => channel.status === "passed"
    ).length;

    return {
      totalProducts: productCountResponse?.data ?? 0,
      connectedStores,
      totalPlatforms,
      pendingSyncs: connectedChannels,
      lowStockItems: lowStockResponse?.data ?? 0,
      storeStatuses,
      channelStatuses,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch dashboard stats"
    );
  }
}
