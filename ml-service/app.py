from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from classifier import DocumentClassifier

app = Flask(__name__)
CORS(app)

# Initialize classifier
classifier = None
try:
    classifier = DocumentClassifier(
        model_path='hybrid_pdf_ocr_model.pt',
        label_map_path='label_map.pkl'
    )
    print("✅ ML Model loaded successfully")
except FileNotFoundError as e:
    print(f"⚠️ Warning: Model files not found: {e}")
    print("⚠️ Place 'hybrid_pdf_ocr_model.pt' and 'label_map.pkl' in this directory")
except Exception as e:
    print(f"⚠️ Warning: Could not load ML model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'ml-classification',
        'model_loaded': classifier is not None
    })

@app.route('/classify', methods=['POST'])
def classify_document():
    if classifier is None:
        return jsonify({
            'error': 'ML model not loaded. Please ensure model files are present.',
            'required_files': ['hybrid_pdf_ocr_model.pt', 'label_map.pkl']
        }), 500
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400
    
    # Save temporarily
    os.makedirs('temp', exist_ok=True)
    temp_path = os.path.join('temp', file.filename)
    file.save(temp_path)
    
    try:
        print(f"📄 Classifying: {file.filename}")
        
        # Classify the document
        result = classifier.classify(temp_path)
        
        print(f"✅ Classification complete: {result['predicted_class']} ({result['confidence']:.2f}%)")
        
        # Clean up
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'category': result['predicted_class'],
            'confidence': result['confidence'],
            'probabilities': result['probabilities']
        })
    
    except Exception as e:
        # Clean up on error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        print(f"❌ Classification error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 ML Classification Service")
    print("=" * 60)
    print(f"🔧 Model Status: {'✅ Loaded' if classifier else '❌ Not Loaded'}")
    print(f"🌐 Server: http://localhost:5000")
    print(f"📋 Health Check: http://localhost:5000/health")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)