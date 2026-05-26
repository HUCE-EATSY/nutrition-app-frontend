import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { adminUsers, adminFoods, adminExercises, adminDashboard } from '../../services/adminApiMock';

/**
 * Admin Test Page - Để test các API endpoints
 * 
 * Navigate: /(admin)/test
 */
export default function AdminTestPage() {
  const router = useRouter();
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setResults(`Running: ${testName}...\n`);
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      setResults(prev => prev + `\n✅ SUCCESS (${duration}ms)\n` + JSON.stringify(result, null, 2));
    } catch (error: any) {
      setResults(prev => prev + `\n❌ ERROR\n` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: 'Get All Users',
      fn: () => adminUsers.getAll({ page: 1, pageSize: 10 }),
    },
    {
      name: 'Get User Stats',
      fn: () => adminUsers.getStats(),
    },
    {
      name: 'Search Users (john)',
      fn: () => adminUsers.getAll({ search: 'john' }),
    },
    {
      name: 'Filter Active Users',
      fn: () => adminUsers.getAll({ status: 'active' }),
    },
    {
      name: 'Get All Foods',
      fn: () => adminFoods.getAll({ page: 1, pageSize: 10 }),
    },
    {
      name: 'Get Food Stats',
      fn: () => adminFoods.getStats(),
    },
    {
      name: 'Search Foods (phở)',
      fn: () => adminFoods.getAll({ search: 'phở' }),
    },
    {
      name: 'Get All Exercises',
      fn: () => adminExercises.getAll({ page: 1, pageSize: 10 }),
    },
    {
      name: 'Get Exercise Stats',
      fn: () => adminExercises.getStats(),
    },
    {
      name: 'Filter Active Exercises',
      fn: () => adminExercises.getAll({ visibility: 'visible' }),
    },
    {
      name: 'Get Dashboard Stats',
      fn: () => adminDashboard.getStats(),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Admin API Test Page</Text>
        <Text style={styles.subtitle}>Test các endpoints với Mock Data</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Thông tin</Text>
        <Text style={styles.infoText}>
          • Đang sử dụng: <Text style={styles.bold}>Mock API</Text>
        </Text>
        <Text style={styles.infoText}>
          • Data lưu trong memory (mất khi refresh)
        </Text>
        <Text style={styles.infoText}>
          • API delay: 500ms (simulate network)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tests</Text>
        
        {tests.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={styles.testButton}
            onPress={() => runTest(test.name, test.fn)}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>{test.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {results && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>Results:</Text>
          <ScrollView style={styles.resultsScroll}>
            <Text style={styles.resultsText}>{results}</Text>
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '600',
  },
  resultsBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    maxHeight: 400,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 10,
  },
  resultsScroll: {
    maxHeight: 350,
  },
  resultsText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
  },
  backButton: {
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
