import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testsApi } from '../utils/api';

const TestScreen = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [solutions, setSolutions] = useState([]);
  // Render all questions on a single page; no index-based navigation
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [correctness, setCorrectness] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await testsApi.get(token);
        if (res.success && res.data?.success) {
          const t = res.data.data;
          if (t.submittedAt) {
            setResult({ score: t.score, result: t.result });
            if (Array.isArray(t.solutions)) setSolutions(t.solutions);
            if (Array.isArray(t.answers)) setAnswers(t.answers);
            if (Array.isArray(t.correctness)) setCorrectness(t.correctness);
          }
          setTest(t);
          setAnswers(new Array((t.questions || []).length).fill(''));
        } else {
          setError(res.data?.message || 'Invalid or expired test link');
        }
      } catch (e) {
        setError(e.message || 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!test || test.expired) return;
    try {
      setSubmitting(true);
      const resp = await testsApi.submit(token, answers);
      if (resp.success && resp.data?.success) {
        setResult({ score: resp.data.data.score, result: resp.data.data.result });
        setSolutions(resp.data.data.solutions || []);
        setAnswers(resp.data.data.answers || answers);
        setCorrectness(resp.data.data.correctness || []);
      } else {
        setError(resp.data?.message || 'Failed to submit test');
      }
    } catch (e) {
      setError(e.message || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-white/30">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/jobseeker-dashboard')}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const questions = test.questions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Assessment{test.internshipTitle ? ` • ${test.internshipTitle}` : ''}</h1>
            <p className="text-sm text-gray-600">Deadline: {new Date(test.expiresAt).toLocaleString()}</p>
            {test.expired && (
              <p className="mt-2 text-sm text-red-600">This test link has expired.</p>
            )}
            {result && (
              <div className={`mt-3 p-3 rounded-lg border ${result.result === 'Passed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className={`${result.result === 'Passed' ? 'text-green-900' : 'text-red-900'} text-sm font-semibold`}>
                  <strong>Score:</strong> {result.score} ({result.result})
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/jobseeker-dashboard')}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Q{idx + 1}. {q.q || q.question || 'Question'}</div>
                    {q.type === 'mcq' && (
                      <div className="space-y-2">
                        {(q.options || []).map((opt, oidx) => (
                          <label key={oidx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              disabled={!!result || test.expired}
                              checked={(answers[idx] || '') === opt}
                              onChange={() => {
                                const next = answers.slice();
                                next[idx] = opt;
                                setAnswers(next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'oneword' && (
                      <input
                        type="text"
                        disabled={!!result || test.expired}
                        value={answers[idx] || ''}
                        onChange={(e) => {
                          const next = answers.slice();
                          next[idx] = e.target.value;
                          setAnswers(next);
                        }}
                        className="w-full border border-gray-300 rounded-lg p-3"
                        placeholder="Your one-word answer"
                      />
                    )}
                    {(q.type === 'text' || q.type === 'code' || !q.type) && (
                      <>
                        {q.type === 'code' && q.starterCode && (
                          <pre className="bg-gray-50 border rounded p-3 text-sm overflow-auto mb-2"><code>{q.starterCode}</code></pre>
                        )}
                        <textarea
                          disabled={!!result || test.expired}
                          value={answers[idx] || ''}
                          onChange={(e) => {
                            const next = answers.slice();
                            next[idx] = e.target.value;
                            setAnswers(next);
                          }}
                          rows={q.type === 'code' ? 8 : 4}
                          className="w-full border border-gray-300 rounded-lg p-3 font-mono"
                          placeholder={q.type === 'code' ? 'Paste your code solution here' : 'Type your answer here...'}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/jobseeker-dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Back to Dashboard
                </button>
                {!result && !test.expired && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                )}
              </div>
            </form>
          ) : (
            // After submission: show full paper with your answers and correct answers
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Full Question Paper</h2>
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Q{idx + 1}. {q.q || q.question || 'Question'}</div>
                    {q.type === 'code' && q.starterCode && (
                      <pre className="bg-gray-50 border rounded p-3 text-sm overflow-auto mb-2"><code>{q.starterCode}</code></pre>
                    )}
                    <div className={`p-3 rounded-lg text-sm mb-2 bg-gray-50 border border-gray-200 text-gray-800`}>
                      <strong>Your Answer:</strong> {String(answers[idx] || '').trim() || '—'}
                    </div>
                    {solutions[idx] && solutions[idx].correctAnswer && (
                      <div className="p-3 rounded-lg text-sm bg-green-50 border border-green-100 text-green-800">
                        <strong>Correct Answer:</strong> {String(solutions[idx].correctAnswer)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Full Question Paper</h2>
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Q{idx + 1}. {q.q || q.question || 'Question'}</div>
                    {q.type === 'code' && q.starterCode && (
                      <pre className="bg-gray-50 border rounded p-3 text-sm overflow-auto mb-2"><code>{q.starterCode}</code></pre>
                    )}
                    <div className={`p-3 rounded-lg text-sm mb-2 ${correctness[idx] ? 'bg-green-50 border border-green-100 text-green-800' : 'bg-red-50 border border-red-100 text-red-800'}`}>
                      <strong>Your Answer:</strong> {String(answers[idx] || '').trim() || '—'}
                    </div>
                    {solutions[idx] && solutions[idx].correctAnswer && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
                        <strong>Correct Answer:</strong> {String(solutions[idx].correctAnswer)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestScreen;


