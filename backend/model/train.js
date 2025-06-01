const tf = require('@tensorflow/tfjs-node');
const { fetchAndPreprocessData } = require('./dataset');

async function trainModel(domain) {
  try {
    const data = await fetchAndPreprocessData(domain);
    if (!data || data.length === 0) {
      console.error('No data fetched for training');
      return;
    }

    const xs = [];
    const ys = [];

    // Mock data preparation
    data.forEach(item => {
      xs.push(item.question);
      ys.push(Math.random() > 0.5 ? 1 : 0); // Mock labels
    });

    // Check if xs has data
    if (xs.length === 0) {
      console.error('No valid features for training');
      return;
    }

    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 16,
        inputShape: [25],
        activation: 'relu',
      })
    );
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    // Mock training data
    const xsTensor = tf.tensor2d(
      xs.map(() => Array(25).fill(Math.random())),
      [xs.length, 25]
    );
    const ysTensor = tf.tensor1d(ys);

    console.log('Starting training...');
    await model.fit(xsTensor, ysTensor, {
      epochs: 10,
      batchSize: 32,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
        }
      }
    });

    console.log('Saving model...');
    await model.save('file://./model');
    console.log('Model saved successfully');
  } catch (err) {
    console.error('Training error:', err.message);
  }
}

trainModel('javascript').catch(console.error);