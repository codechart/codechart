import { FeatureStatus, VoteImportance, UsageLevel, Purpose, RoleType } from '@/types/enums';
import { supabase } from './client';


export interface Feature {
  id: number;
  name: string;
  description: string;
  created_at: string;
  status: FeatureStatus;
}

export interface FeatureVote {
  feature_id: number;
  importance: VoteImportance;
  usage_level: UsageLevel;
  usage_types: Purpose[];
  roles: RoleType[];
  status?: FeatureStatus;
  email?: string;
}

interface ResponderData {
  email: string;
  roles: RoleType[];
  usage_level: UsageLevel;
  usage_types: Purpose[];
}


const priorityMap = {
  'not_important': 1,
  'low_priority': 2,
  'medium_priority': 3,
  'high_priority': 4,
  'crucial': 5
} as const;

const priorityReverseMap = {
  1: 'not_important',
  2: 'low_priority',
  3: 'medium_priority',
  4: 'high_priority',
  5: 'crucial'
} as const;

export const submitFeatureVote = async (vote: FeatureVote) => {
  const { data, error } = await supabase
    .from('feature_votes')
    .insert([{
      ...vote,
      created_at: new Date().toISOString(),
      status: 'open'
    }]);

  if (error) throw error;
  return data;
};

interface MappedFeature {
  id: number;
  title: string;
  description: string;
  priority: keyof typeof priorityMap;
  status: FeatureStatus;
  averagePriority: keyof typeof priorityMap;
  voterCount: number;
}

export const fetchFeatures = async (): Promise<MappedFeature[]> => {
  console.log('Fetching features...');
  
  // First, let's check if we can get any data from feature_list
  const basicQuery = await supabase
    .from('feature_list')
    .select('*');
  console.log('Basic feature_list query:', basicQuery);

  // Then try the full query
  const { data, error } = await supabase
  .from('feature_list')
  .select(`
    *,
    feature_votes!left (
      importance
    )
  `)

  console.log('Full query response:', { data, error });

  if (error) throw error;

  const mappedFeatures = data?.map(feature => {
    const voteCount = feature.feature_votes.length;
    const avgPriorityNum = voteCount ? 
      Math.round(feature.feature_votes.reduce((acc, vote) => 
        acc + priorityMap[vote.importance as keyof typeof priorityMap], 0
      ) / voteCount) : 3;

    const status = feature.feature_votes[0]?.status || 'open';

    return {
      id: feature.id,
      title: feature.name,
      description: feature.description,
      priority: priorityReverseMap[avgPriorityNum as keyof typeof priorityReverseMap],
      status,
      averagePriority: priorityReverseMap[avgPriorityNum as keyof typeof priorityReverseMap],
      voterCount: voteCount
    };
  }) || [];

  console.log('Mapped features:', mappedFeatures);
  return mappedFeatures;
}; 

export const submitNewFeature = async (
  name: string, 
  description: string, 
  vote: Omit<FeatureVote, 'feature_id'>
) => {
  // First insert the feature
  const { data, error } = await supabase
    .from('feature_list')
    .insert([{
      name,
      description
    }])
    .select();

  if (error) throw error;

  // Then submit the vote for the new feature
  if (data && data[0]) {
    const featureId = data[0].id;
    await submitFeatureVote({
      feature_id: featureId,
      ...vote
    });
  }

  return data;
};

export const createResponder = async (data: ResponderData) => {
  const { data: responder, error } = await supabase
    .from('responders')
    .upsert([{
      email: data.email,
      roles: data.roles,
      usage_level: data.usage_level,
      usage_types: data.usage_types
    }], {
      onConflict: 'email',
      ignoreDuplicates: false
    })
    .select();

  if (error) throw error;
  return responder;
};