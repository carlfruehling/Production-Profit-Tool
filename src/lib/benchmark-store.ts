import {
  BenchmarkDimensions,
} from '@/types/calculation';
import {
  BenchmarkProfile,
  createAllSeedBenchmarkProfiles,
  createSeedBenchmarkProfile,
  normalizeBenchmarkProfile,
} from '@/lib/benchmark';
import { supabase } from '@/lib/supabase';

const BENCHMARK_PROFILE_TABLE = 'industry_benchmark_profiles';
const ALL_SEED_PROFILES = createAllSeedBenchmarkProfiles();

let benchmarkTableAvailable: boolean | null = null;
let benchmarkSeedInitialized = false;

async function upsertSeedProfilesIfNeeded() {
  const { count, error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .select('bucket_key', { count: 'exact', head: true });

  if (error) {
    benchmarkTableAvailable = false;
    console.warn('[benchmark] Benchmark table unavailable, using local seed fallback', error);
    return false;
  }

  benchmarkTableAvailable = true;

  if ((count ?? 0) >= ALL_SEED_PROFILES.length) {
    benchmarkSeedInitialized = true;
    return true;
  }

  const { error: upsertError } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .upsert(ALL_SEED_PROFILES, { onConflict: 'bucket_key' });

  if (upsertError) {
    console.warn('[benchmark] Seed upsert failed, using local fallback', upsertError);
    return false;
  }

  benchmarkSeedInitialized = true;
  return true;
}

export async function ensureBenchmarkProfilesSeeded() {
  if (benchmarkTableAvailable === false) {
    return false;
  }

  if (benchmarkSeedInitialized) {
    return true;
  }

  return upsertSeedProfilesIfNeeded();
}

export async function getBenchmarkProfile(dimensions: BenchmarkDimensions) {
  const benchmarkReady = await ensureBenchmarkProfilesSeeded();

  if (!benchmarkReady) {
    return createSeedBenchmarkProfile(dimensions);
  }

  const { data, error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .select('*')
    .eq('bucket_key', dimensions.key)
    .maybeSingle();

  if (error) {
    console.warn('[benchmark] Profile lookup failed, using local fallback', error);
    return createSeedBenchmarkProfile(dimensions);
  }

  return normalizeBenchmarkProfile(data, dimensions);
}

export async function getBenchmarkProfiles(dimensionsList: BenchmarkDimensions[]) {
  const uniqueDimensions = Array.from(
    new Map(dimensionsList.map((dimensions) => [dimensions.key, dimensions])).values()
  );

  if (uniqueDimensions.length === 0) {
    return new Map<string, BenchmarkProfile>();
  }

  const benchmarkReady = await ensureBenchmarkProfilesSeeded();

  if (!benchmarkReady) {
    return new Map(
      uniqueDimensions.map((dimensions) => [dimensions.key, createSeedBenchmarkProfile(dimensions)])
    );
  }

  const { data, error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .select('*')
    .in('bucket_key', uniqueDimensions.map((dimensions) => dimensions.key));

  if (error) {
    console.warn('[benchmark] Bulk profile lookup failed, using local fallback', error);
    return new Map(
      uniqueDimensions.map((dimensions) => [dimensions.key, createSeedBenchmarkProfile(dimensions)])
    );
  }

  const rowsByKey = new Map<string, Partial<BenchmarkProfile>>((data ?? []).map((row) => [row.bucket_key as string, row]));

  return new Map(
    uniqueDimensions.map((dimensions) => [
      dimensions.key,
      normalizeBenchmarkProfile(rowsByKey.get(dimensions.key), dimensions),
    ])
  );
}

export async function persistBenchmarkProfile(profile: BenchmarkProfile) {
  const benchmarkReady = await ensureBenchmarkProfilesSeeded();

  if (!benchmarkReady) {
    return false;
  }

  const { error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'bucket_key' });

  if (error) {
    console.warn('[benchmark] Profile update skipped', error);
    return false;
  }

  return true;
}

export async function getBenchmarkAdminStats() {
  const benchmarkReady = await ensureBenchmarkProfilesSeeded();

  if (!benchmarkReady) {
    return {
      usingFallback: true,
      totalProfiles: ALL_SEED_PROFILES.length,
      profilesWithRealData: 0,
      totalRealSamples: 0,
      totalSeedSamples: ALL_SEED_PROFILES.reduce((sum, profile) => sum + profile.seed_sample_size, 0),
      lastUpdatedAt: null,
    };
  }

  const { data, error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .select('seed_sample_size, real_sample_size, updated_at');

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const totalRealSamples = rows.reduce((sum, row) => sum + Number(row.real_sample_size ?? 0), 0);
  const totalSeedSamples = rows.reduce((sum, row) => sum + Number(row.seed_sample_size ?? 0), 0);
  const profilesWithRealData = rows.filter((row) => Number(row.real_sample_size ?? 0) > 0).length;
  const lastUpdatedAt = rows
    .map((row) => row.updated_at as string | null)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return {
    usingFallback: false,
    totalProfiles: rows.length,
    profilesWithRealData,
    totalRealSamples,
    totalSeedSamples,
    lastUpdatedAt,
  };
}

export async function reseedBenchmarkProfiles() {
  const payload = ALL_SEED_PROFILES.map((profile) => ({
    ...profile,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .upsert(payload, { onConflict: 'bucket_key' });

  if (error) {
    throw error;
  }

  benchmarkTableAvailable = true;
  benchmarkSeedInitialized = true;

  return {
    updatedProfiles: payload.length,
  };
}

export async function resetBenchmarkRealData() {
  const benchmarkReady = await ensureBenchmarkProfilesSeeded();

  if (!benchmarkReady) {
    return {
      updatedProfiles: 0,
      usingFallback: true,
    };
  }

  const { data, error } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .select('*');

  if (error) {
    throw error;
  }

  const payload = (data ?? []).map((profile) => ({
    ...profile,
    real_sample_size: 0,
    real_avg_contribution_per_hour: 0,
    updated_at: new Date().toISOString(),
  }));

  const { error: updateError } = await supabase
    .from(BENCHMARK_PROFILE_TABLE)
    .upsert(payload, { onConflict: 'bucket_key' });

  if (updateError) {
    throw updateError;
  }

  return {
    updatedProfiles: payload.length,
    usingFallback: false,
  };
}
