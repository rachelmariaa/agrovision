import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class AgroMLModel:
    def __init__(self):
        self.crops = ['Wheat', 'Rice', 'Corn', 'Cotton', 'Sugarcane', 'Soybeans']
        self.conditions = ['Poor', 'Fair', 'Good', 'Excellent']
        
        self.crop_encoder = LabelEncoder()
        self.crop_encoder.fit(self.crops)
        
        self.rec_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.cond_model = RandomForestClassifier(n_estimators=100, random_state=42)
        
        self._train_models()
        
    def _train_models(self):
        # Generate synthetic data for Recommendation
        # Features: NDVI (0-1), Soil Moisture (0-1), Rainfall (0-300), Temp (5-45), Hist NDVI (0-1)
        np.random.seed(42)
        n_samples = 2000
        
        X_rec = []
        y_rec = []
        
        for _ in range(n_samples):
            crop = np.random.choice(self.crops)
            
            # Base features based on crop
            if crop == 'Rice':
                temp, rain, sm, ndvi, hist = np.random.uniform(20, 40), np.random.uniform(150, 300), np.random.uniform(0.6, 1.0), np.random.uniform(0.5, 0.9), np.random.uniform(0.5, 0.9)
            elif crop == 'Wheat':
                temp, rain, sm, ndvi, hist = np.random.uniform(10, 25), np.random.uniform(50, 150), np.random.uniform(0.3, 0.6), np.random.uniform(0.4, 0.8), np.random.uniform(0.4, 0.8)
            elif crop == 'Cotton':
                temp, rain, sm, ndvi, hist = np.random.uniform(25, 45), np.random.uniform(50, 100), np.random.uniform(0.2, 0.5), np.random.uniform(0.3, 0.7), np.random.uniform(0.3, 0.7)
            elif crop == 'Sugarcane':
                temp, rain, sm, ndvi, hist = np.random.uniform(20, 35), np.random.uniform(100, 250), np.random.uniform(0.5, 0.9), np.random.uniform(0.6, 1.0), np.random.uniform(0.6, 1.0)
            elif crop == 'Corn':
                temp, rain, sm, ndvi, hist = np.random.uniform(18, 30), np.random.uniform(80, 150), np.random.uniform(0.4, 0.7), np.random.uniform(0.5, 0.9), np.random.uniform(0.5, 0.9)
            elif crop == 'Soybeans':
                temp, rain, sm, ndvi, hist = np.random.uniform(20, 30), np.random.uniform(60, 120), np.random.uniform(0.3, 0.6), np.random.uniform(0.4, 0.8), np.random.uniform(0.4, 0.8)
                
            X_rec.append([ndvi, sm, rain, temp, hist])
            y_rec.append(crop)
            
        self.rec_model.fit(X_rec, y_rec)
        
        # Generate synthetic data for Condition Prediction
        # Features: NDVI, Soil Moisture, Rainfall, Temp, Hist NDVI, Crop Type (encoded)
        X_cond = []
        y_cond = []
        for _ in range(n_samples):
            ndvi = np.random.uniform(0, 1)
            sm = np.random.uniform(0, 1)
            rain = np.random.uniform(0, 300)
            temp = np.random.uniform(5, 45)
            hist = np.random.uniform(0, 1)
            crop = np.random.choice(self.crops)
            encoded_crop = self.crop_encoder.transform([crop])[0]
            
            # Simple heuristic for condition
            condition_score = ndvi * 0.4 + sm * 0.2 + hist * 0.2
            if condition_score > 0.6: cond = 'Excellent'
            elif condition_score > 0.4: cond = 'Good'
            elif condition_score > 0.2: cond = 'Fair'
            else: cond = 'Poor'
                
            X_cond.append([ndvi, sm, rain, temp, hist, encoded_crop])
            y_cond.append(cond)
            
        self.cond_model.fit(X_cond, y_cond)
        
    def recommend_crops(self, ndvi, sm, rain, temp, hist_ndvi):
        probs = self.rec_model.predict_proba([[ndvi, sm, rain, temp, hist_ndvi]])[0]
        top_indices = np.argsort(probs)[::-1][:3]
        return [{"crop": self.rec_model.classes_[i], "confidence": round(probs[i] * 100, 1)} for i in top_indices]

    def predict_condition(self, ndvi, sm, rain, temp, hist_ndvi, crop_type):
        try:
            encoded_crop = self.crop_encoder.transform([crop_type])[0]
        except:
            encoded_crop = 0 # default fallback
        pred = self.cond_model.predict([[ndvi, sm, rain, temp, hist_ndvi, encoded_crop]])[0]
        return pred

agro_ml = AgroMLModel()
