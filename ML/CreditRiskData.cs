using Microsoft.ML.Data;

namespace Vakifbankstajyer.ML
{
    public class CreditRiskData
    {
        [LoadColumn(1)]
        public float Age { get; set; }
        
        [LoadColumn(2)]
        public string Sex { get; set; } = string.Empty;
        
        [LoadColumn(3)]
        public float Job { get; set; }
        
        [LoadColumn(4)]
        public string Housing { get; set; } = string.Empty;
        
        [LoadColumn(5)]
        public string SavingAccounts { get; set; } = string.Empty;
        
        [LoadColumn(6)]
        public string CheckingAccount { get; set; } = string.Empty;
        
        [LoadColumn(7)]
        public float CreditAmount { get; set; }
        
        [LoadColumn(8)]
        public float Duration { get; set; } // Term in months
        
        [LoadColumn(9)]
        public string Purpose { get; set; } = string.Empty;
        
        [LoadColumn(10), ColumnName("Label")]
        public string Risk { get; set; } = string.Empty; // "good" or "bad"
    }

    public class CreditRiskPrediction
    {
        [ColumnName("PredictedLabel")]
        public string PredictedLabel { get; set; } = string.Empty;

        [ColumnName("Score")]
        public float[] Score { get; set; } = Array.Empty<float>();
    }
}
