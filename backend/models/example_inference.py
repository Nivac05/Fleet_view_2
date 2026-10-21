# Example: load model and predict one step
import joblib, pandas as pd
from datetime import datetime

model = joblib.load("xgb_demand_model.joblib")
feature_cols = ['lag1', 'dow', 'hour']

# replace these with real latest values
last_y   = 123.0             # last observed demand
last_dt  = datetime.utcnow() # or your local timestamp

row = pd.DataFrame([[
    last_y,                # lag1
    last_dt.weekday(),     # dow
    last_dt.hour           # hour
]], columns=feature_cols)

print("Predicted next-hour demand:", float(model.predict(row)[0]))
