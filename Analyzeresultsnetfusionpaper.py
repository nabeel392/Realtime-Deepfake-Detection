#!/usr/bin/env python
# coding: utf-8

# # Video Face Manipulation Detection Through Ensemble of CNNs
# Image and Sound Processing Lab - Politecnico di Milano
# - Nicolò Bonettini
# - Edoardo Daniele Cannas
# - Sara Mandelli
# - Luca Bondi
# - Paolo Bestagini
# 
# # Net fusion results analysis
# The notebook analyzes the results of fusing different models results in different combinations

# ## Libraries loading

# In[1]:


get_ipython().run_line_magic('matplotlib', 'inline')
import ntpath
import os
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd
import seaborn as sns
import sklearn.metrics as M
from scipy.special import expit
from sklearn.metrics import log_loss
from tqdm.notebook import tqdm


# ## Parameters

# In[2]:


results_root = Path('results/')
results_model_folder = list(results_root.glob('net-*'))
column_list = ['video', 'score', 'label']
do_distplot = False


# ## Helper functions

# In[3]:


def compute_metrics(df_res:pd.DataFrame,train_tag:str) -> dict:
    numreal = sum(df_res['label']==False)
    numfake = sum(df_res['label']==True
)
    
    netname = train_tag.split('net-')[1].split('_')[0]
    traindb = train_tag.split('traindb-')[1].split('_')[0]
    
    loss = M.log_loss(df_res['label'],expit(df_res['score']))
    acc = M.accuracy_score(df_res['label'],df_res['score']>0)
    accbal = M.balanced_accuracy_score(df_res['label'],df_res['score']>0)
    rocauc = M.roc_auc_score(df_res['label'],df_res['score'])
    
    res_dict = {'traintag':train_tag,
                'net':netname,
                'traindb': traindb,
                'testdb':testdb,'testsplit':testsplit,
                'numreal':numreal,'numfake':numfake,
                'loss':loss,
                'acc':acc,'accbal':accbal,
                'rocauc':rocauc} 
    return res_dict


# In[4]:


def get_df(video_all_df, dataset):
    selected_df = video_all_df.loc[dataset].unstack(['model'])['score']
    models = selected_df.columns
    aux_df = video_all_df.loc[dataset].unstack(['model'])['video']
    selected_df['video'] = aux_df[aux_df.columns[0]]
    selected_df['label'] = video_all_df.loc[dataset].unstack(['model'])['label'].mean(axis=1)
    mapper = dict()
    for model in models:
        mapper[model] = model.split('net-')[1].split('_traindb')[0]
    selected_df = selected_df.rename(mapper, axis=1)
    return selected_df


# ## Load data

# In[5]:


# Load data in multi-index dataframe
if os.path.exists('data_frame_df.pkl'):
    data_frame_df = pd.read_pickle('data_frame_df.pkl')
    model_list = []
    for model_folder in tqdm(results_model_folder):
        dataset_list = []
        train_model_tag = model_folder.name
        model_results = model_folder.glob('*.pkl')
        for model_path in model_results:
            dataset_tag = os.path.splitext(ntpath.split(model_path)[1])[0]
            dataset_list.append(dataset_tag)
        model_list.append(train_model_tag)
else:
    data_model_list = []
    model_list = []
    for model_folder in tqdm(results_model_folder):
        data_dataset_list = []
        dataset_list = []
        train_model_tag = model_folder.name
        model_results = model_folder.glob('*.pkl')
        for model_path in model_results:
            netname = train_model_tag.split('net-')[1].split('_')[0]
            traindb = train_model_tag.split('traindb-')[1].split('_')[0]
            testdb, testsplit = model_path.with_suffix('').name.rsplit('_',1)
            dataset_tag = os.path.splitext(ntpath.split(model_path)[1])[0]
            df_frames = pd.read_pickle(model_path)[column_list]
            # Add info on training and test datasets
            df_frames['netname'] = netname
            df_frames['train_db'] = traindb
            df_frames['test_db'] = testdb
            df_frames['test_split'] = testsplit
            data_dataset_list.append(df_frames)
            dataset_list.append(dataset_tag)
        data_model_list.append(pd.concat(data_dataset_list, keys=dataset_list, names=['dataset']))
        model_list.append(train_model_tag)
    data_frame_df = pd.concat(data_model_list, keys=model_list, names=['model']).swaplevel(0, 1)
    data_frame_df.to_pickle('data_frame_df.pkl')


# ### Remove cross-test

# In[6]:


idx_same_train_test = data_frame_df['train_db'] == data_frame_df['test_db']
data_frame_df = data_frame_df.loc[idx_same_train_test]


# ### Eliminate Xception experiments, consider only test sets

# In[7]:


data_frame_df = data_frame_df[data_frame_df['test_split']=='test']
dataset_list = [x for x in dataset_list if "_val" not in x]
print('Datasets considered are {}'.format(dataset_list))
model_selection_list = ['EfficientNetB4', 'EfficientNetAutoAttB4', 'EfficientNetB4ST', 'EfficientNetAutoAttB4ST']
xception_df = data_frame_df[data_frame_df['netname'].isin(['Xception'])]
data_frame_df = data_frame_df[data_frame_df['netname'].isin(model_selection_list)]
model_list = data_frame_df.index.get_level_values(1).unique()
print('Models considered are {}'.format(data_frame_df['netname'].unique()))


# In[8]:


selected_df = get_df(data_frame_df, dataset='ff-c23-720-140-140_test')
selected_df.head()


# ## Pair plot per-frame

# In[9]:


# FF++
net_list = list(data_frame_df['netname'].unique())
selected_df = get_df(data_frame_df, dataset='ff-c23-720-140-140_test')
selected_df[net_list] = selected_df[net_list].apply(expit)
selected_df = selected_df.rename(columns={'EfficientNetAutoAttB4': 'EfficientNetAttB4',
                                          'EfficientNetAutoAttB4ST': 'EfficientNetAttB4ST'})
selected_df = selected_df.sample(n=2000, random_state=0)
selected_df = selected_df.drop(columns=['video'])

selected_df['label'] = selected_df['label'].apply(lambda x: 'Fake' if x==1 else 'Real')
g = sns.pairplot(selected_df, hue='label', plot_kws=dict(alpha=0.03));
g._legend.remove()


# In[10]:


# DFDC
net_list = list(data_frame_df['netname'].unique())
selected_df = get_df(data_frame_df, dataset='dfdc-35-5-10_test')
selected_df[net_list] = selected_df[net_list].apply(expit)
selected_df = selected_df.rename(columns={'EfficientNetAutoAttB4': 'EfficientNetAttB4',
                                          'EfficientNetAutoAttB4ST': 'EfficientNetAttB4ST'})
selected_df = selected_df.sample(n=2000, random_state=0)
selected_df = selected_df.drop(columns=['video'])

selected_df['label'] = selected_df['label'].apply(lambda x: 'Fake' if x==1 else 'Real')
g = sns.pairplot(selected_df, hue='label', plot_kws=dict(alpha=0.03));
g._legend.remove()


# ## Pair plot per-video
# 

# In[11]:


# FF++
net_list = list(data_frame_df['netname'].unique())
selected_df = get_df(data_frame_df, dataset='ff-c23-720-140-140_test')
selected_df = selected_df.groupby('video')
selected_df_video = selected_df.mean().apply(expit)
selected_df_video = selected_df_video.rename(columns={'EfficientNetAutoAttB4': 'EfficientNetAttB4',
                                          'EfficientNetAutoAttB4ST': 'EfficientNetAttB4ST'})

selected_df_video['label'] = selected_df['label'].mean().apply(lambda x: 'Fake' if x==1 else 'Real')
g = sns.pairplot(selected_df_video, hue='label', plot_kws=dict(alpha=0.08))
g._legend.remove()


# In[12]:


# DFDC
net_list = list(data_frame_df['netname'].unique())
selected_df = get_df(data_frame_df, dataset='dfdc-35-5-10_test')
selected_df = selected_df.groupby('video')
selected_df_video = selected_df.mean().apply(expit)
selected_df_video = selected_df_video.rename(columns={'EfficientNetAutoAttB4': 'EfficientNetAttB4',
                                          'EfficientNetAutoAttB4ST': 'EfficientNetAttB4ST'})
selected_df_video = selected_df_video.sample(n=2000, random_state=0)

selected_df_video['label'] = selected_df['label'].mean().apply(lambda x: 'Fake' if x==1 else 'Real')
g = sns.pairplot(selected_df_video, hue='label', plot_kws=dict(alpha=0.08))
g._legend.remove()


# ## Xception per-frame

# In[13]:


net_list = ['Xception']
comb_list = list(combinations(net_list, 1))
iterables = [dataset_list, ['loss', 'auc']]
index = pd.MultiIndex.from_product(iterables, names=['dataset', 'metric'])
results_x_df = pd.DataFrame(index=index, columns=comb_list)


# In[14]:


for dataset in dataset_list:
    print(dataset)
    for model_comb in tqdm(comb_list):
        df = get_df(xception_df, dataset)
        results_x_df[model_comb][dataset, 'loss'] = log_loss(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                      axis=1)))
        results_x_df[model_comb][dataset, 'auc'] = M.roc_auc_score(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                            axis=1)))


# In[15]:


results_x_df.T


# ## Xception per-video

# In[16]:


net_list = ['Xception']
comb_list = list(combinations(net_list, 1))
iterables = [dataset_list, ['loss', 'auc']]
index = pd.MultiIndex.from_product(iterables, names=['dataset', 'metric'])
results_x_df = pd.DataFrame(index=index, columns=comb_list)


# In[17]:


for dataset in dataset_list:
    print(dataset)
    for model_comb in tqdm(comb_list):
        df = get_df(xception_df, dataset)
        df = df.groupby('video')
        df = df.mean()
        results_x_df[model_comb][dataset, 'loss'] = log_loss(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                      axis=1)))
        results_x_df[model_comb][dataset, 'auc'] = M.roc_auc_score(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                            axis=1)))


# In[18]:


results_x_df.T


# ## Combinations per-frame

# In[19]:


net_list = list(data_frame_df['netname'].unique())
comb_list_1 = list(combinations(net_list, 1))
comb_list_2 = list(combinations(net_list, 2))
comb_list_3 = list(combinations(net_list, 3))
comb_list_4 = list(combinations(net_list, 4))
comb_list = comb_list_1 + comb_list_2 + comb_list_3 + comb_list_4
iterables = [dataset_list, ['loss', 'auc']]
index = pd.MultiIndex.from_product(iterables, names=['dataset', 'metric'])
results_df = pd.DataFrame(index=index, columns=comb_list)


# In[20]:


for dataset in dataset_list:
    print(dataset)
    for model_comb in tqdm(comb_list):
        df = get_df(data_frame_df, dataset)
        results_df[model_comb][dataset, 'loss'] = log_loss(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                      axis=1)))
        results_df[model_comb][dataset, 'auc'] = M.roc_auc_score(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                            axis=1)))


# In[21]:


results_df.T


# ## Combinations per-video

# In[22]:


net_list = list(data_frame_df['netname'].unique())
comb_list_1 = list(combinations(net_list, 1))
comb_list_2 = list(combinations(net_list, 2))
comb_list_3 = list(combinations(net_list, 3))
comb_list_4 = list(combinations(net_list, 4))
comb_list = comb_list_1 + comb_list_2 + comb_list_3 + comb_list_4
iterables = [dataset_list, ['loss', 'auc']]
index = pd.MultiIndex.from_product(iterables, names=['dataset', 'metric'])
results_df = pd.DataFrame(index=index, columns=comb_list)


# In[23]:


for dataset in dataset_list:
    print(dataset)
    for model_comb in tqdm(comb_list):
        df = get_df(data_frame_df, dataset)
        df = df.groupby('video')
        df = df.mean()
        results_df[model_comb][dataset, 'loss'] = log_loss(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                      axis=1)))
        results_df[model_comb][dataset, 'auc'] = M.roc_auc_score(df['label'], expit(np.mean(df[list(model_comb)],
                                                                                            axis=1)))


# In[24]:


results_df.T


# In[ ]:




