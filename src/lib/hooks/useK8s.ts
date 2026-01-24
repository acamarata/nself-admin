'use client'

import type {
  HelmRelease,
  HelmRepo,
  K8sCluster,
  K8sDeployment,
  K8sIngress,
  K8sNamespace,
  K8sPod,
  K8sService,
} from '@/types/k8s'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function useK8sStatus() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    connected: boolean
    cluster?: K8sCluster
    deployments: K8sDeployment[]
    pods: K8sPod[]
  }>('/api/k8s', fetcher, { refreshInterval: 10000 })

  return {
    connected: data?.connected || false,
    cluster: data?.cluster,
    deployments: data?.deployments || [],
    pods: data?.pods || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useK8sClusters() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    clusters: K8sCluster[]
  }>('/api/k8s/clusters', fetcher, { refreshInterval: 60000 })

  return {
    clusters: data?.clusters || [],
    current: data?.clusters?.find((c) => c.current),
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useK8sNamespaces() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    namespaces: K8sNamespace[]
  }>('/api/k8s/namespaces', fetcher, { refreshInterval: 30000 })

  return {
    namespaces: data?.namespaces || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useK8sDeployments() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    deployments: K8sDeployment[]
  }>('/api/k8s/deployments', fetcher, { refreshInterval: 10000 })

  return {
    deployments: data?.deployments || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useK8sPods() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    pods: K8sPod[]
  }>('/api/k8s/pods', fetcher, { refreshInterval: 5000 })

  return {
    pods: data?.pods || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useK8sServices() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    services: K8sService[]
  }>('/api/k8s/services', fetcher, { refreshInterval: 30000 })

  return {
    services: data?.services || [],
    isLoading,
    isError: !!error,
  }
}

export function useK8sIngresses() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    ingresses: K8sIngress[]
  }>('/api/k8s/ingresses', fetcher, { refreshInterval: 30000 })

  return {
    ingresses: data?.ingresses || [],
    isLoading,
    isError: !!error,
  }
}

// Helm hooks
export function useHelmReleases() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    releases: HelmRelease[]
  }>('/api/helm', fetcher, { refreshInterval: 30000 })

  return {
    releases: data?.releases || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

export function useHelmRepos() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean
    repos: HelmRepo[]
  }>('/api/helm/repos', fetcher)

  return {
    repos: data?.repos || [],
    isLoading,
    isError: !!error,
    mutate,
  }
}
