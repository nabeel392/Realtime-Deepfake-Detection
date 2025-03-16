#!/usr/bin/env python
# coding: utf-8

# # Video Face Manipulation Detection Through Ensemble of CNNs
# Image and Sound Processing Lab - Politecnico di Milano
# - Nicolò Bonettini
# - Edoardo Daniele Cannas
# - Sara Mandelli
# - Luca Bondi
# - Paolo Bestagini

# In[ ]:


from pathlib import Path

import numpy as np
import pandas as pd
import sklearn.metrics as M
from scipy.special import expit
from tqdm.notebook import tqdm


# In[ ]:


results_root = Path('results/')
results_model_folder = list(results_root.glob('net-*'))


# In[ ]:


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


# In[ ]:


results_frame_list = []
results_video_list = []

for model_folder in tqdm(results_model_folder):
    train_model_tag = model_folder.name
    model_results = model_folder.glob('*.pkl')
    for model_path in model_results:
        testdb,testsplit = model_path.with_suffix('').name.rsplit('_',1)
        
        df_frames = pd.read_pickle(model_path)
        results_frame_list.append(compute_metrics(df_frames,train_model_tag))
        
        df_videos = df_frames[['video','label','score']].groupby('video').mean()
        df_videos['label'] = df_videos['label'].astype(np.bool)
        results_video_list.append(compute_metrics(df_videos,train_model_tag))


# In[ ]:


df_res_frames = pd.DataFrame(results_frame_list)
df_res_frames


# In[ ]:


df_res_video = pd.DataFrame(results_video_list)
df_res_video


# In[ ]:


df_res_frames.to_csv(results_root.joinpath('frames.csv'),index=False)
df_res_video.to_csv(results_root.joinpath('videos.csv'),index=False)

