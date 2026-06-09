using System;
using System.IO;
using Microsoft.ML;
using Microsoft.ML.Data;
using Vakifbankstajyer.ML;

namespace Vakifbankstajyer.Services
{
    public class RiskAnalysisService
    {
        private static readonly string ModelPath = Path.Combine(Environment.CurrentDirectory, "MLModel.zip");
        private static readonly string DataPath = Path.Combine(Environment.CurrentDirectory, "german_credit_data.csv");
        private readonly MLContext _mlContext;
        private ITransformer? _model;
        private PredictionEngine<CreditRiskData, CreditRiskPrediction>? _predictionEngine;

        public RiskAnalysisService()
        {
            _mlContext = new MLContext(seed: 0);
        }

        public void TrainModel()
        {
            if (!File.Exists(DataPath))
            {
                throw new FileNotFoundException($"Data file not found at {DataPath}");
            }

            // Load Data
            var dataView = _mlContext.Data.LoadFromTextFile<CreditRiskData>(
                path: DataPath,
                hasHeader: true,
                separatorChar: ',');

            // Data Preparation & Pipeline
            var pipeline = _mlContext.Transforms.Conversion.MapValueToKey(inputColumnName: "Label", outputColumnName: "Label")
                .Append(_mlContext.Transforms.Categorical.OneHotEncoding(new[]
                {
                    new InputOutputColumnPair("SexEncoded", "Sex"),
                    new InputOutputColumnPair("HousingEncoded", "Housing"),
                    new InputOutputColumnPair("SavingAccountsEncoded", "SavingAccounts"),
                    new InputOutputColumnPair("CheckingAccountEncoded", "CheckingAccount"),
                    new InputOutputColumnPair("PurposeEncoded", "Purpose")
                }))
                .Append(_mlContext.Transforms.Concatenate("Features",
                    "Age", "Job", "CreditAmount", "Duration",
                    "SexEncoded", "HousingEncoded", "SavingAccountsEncoded", "CheckingAccountEncoded", "PurposeEncoded"))
                .Append(_mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy(labelColumnName: "Label", featureColumnName: "Features"))
                .Append(_mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel"));

            // Train the Model
            _model = pipeline.Fit(dataView);

            // Save the Model
            _mlContext.Model.Save(_model, dataView.Schema, ModelPath);
            
            // Create Prediction Engine
            _predictionEngine = _mlContext.Model.CreatePredictionEngine<CreditRiskData, CreditRiskPrediction>(_model);
        }

        public CreditRiskPrediction PredictRisk(CreditRiskData inputData)
        {
            if (_predictionEngine == null)
            {
                // Try load from file if already trained
                if (File.Exists(ModelPath))
                {
                    DataViewSchema modelSchema;
                    _model = _mlContext.Model.Load(ModelPath, out modelSchema);
                    _predictionEngine = _mlContext.Model.CreatePredictionEngine<CreditRiskData, CreditRiskPrediction>(_model);
                }
                else
                {
                    TrainModel(); // Train if not exists
                }
            }

            return _predictionEngine!.Predict(inputData);
        }
    }
}
