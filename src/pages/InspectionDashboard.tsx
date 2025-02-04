import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import supabase from '../helper/supabaseClient';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InspectionDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [stats, setStats] = useState({
    totalInspections: 0,
    inProgress: 0,
    completed: 0,
    approvalRate: 0,
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas gerais
      const { data: inspections, error: inspectionsError } = await supabase
        .from('inspections')
        .select('*');

      if (inspectionsError) throw inspectionsError;

      // Buscar itens de inspeção para estatísticas por categoria
      const { data: inspectionItems, error: itemsError } = await supabase
        .from('inspection_items')
        .select(`
          *,
          categories:category (
            name
          )
        `);

      if (itemsError) throw itemsError;

      // Calcular estatísticas
      const totalInspections = inspections?.length || 0;
      const inProgress = inspections?.filter(i => i.status === 'em_andamento').length || 0;
      const completed = inspections?.filter(i => i.status === 'concluida').length || 0;

      const validItems = inspectionItems?.filter(item => item.status === 'valid').length || 0;
      const totalItems = inspectionItems?.length || 0;
      const approvalRate = totalItems > 0 ? (validItems / totalItems) * 100 : 0;

      setStats({
        totalInspections,
        inProgress,
        completed,
        approvalRate,
      });

      // Processar dados para gráficos
      if (inspectionItems) {
        // Estatísticas por categoria
        const categoryData = inspectionItems.reduce((acc: any, item) => {
          const categoryName = item.categories?.name || 'Sem categoria';
          if (!acc[categoryName]) {
            acc[categoryName] = { valid: 0, invalid: 0 };
          }
          if (item.status === 'valid') {
            acc[categoryName].valid++;
          } else if (item.status === 'invalid') {
            acc[categoryName].invalid++;
          }
          return acc;
        }, {});

        const formattedCategoryStats = Object.entries(categoryData).map(([name, stats]: [string, any]) => ({
          name,
          aprovados: stats.valid,
          reprovados: stats.invalid,
        }));

        setCategoryStats(formattedCategoryStats);
      }

      // Processar dados para timeline
      if (inspections) {
        const timelineStats = inspections.reduce((acc: any, inspection) => {
          const date = format(new Date(inspection.inspection_date), 'dd/MM/yyyy', { locale: dateFnsPtBR });
          if (!acc[date]) {
            acc[date] = { date, total: 0, concluidas: 0 };
          }
          acc[date].total++;
          if (inspection.status === 'concluida') {
            acc[date].concluidas++;
          }
          return acc;
        }, {});

        setTimelineData(Object.values(timelineStats));
      }

      // Buscar inspeções recentes
      const { data: recent } = await supabase
        .from('inspections')
        .select(`
          *,
          trucks (nome)
        `)
        .order('inspection_date', { ascending: false })
        .limit(5);

      if (recent) {
        setRecentInspections(recent);
      }

      // Buscar alertas críticos (itens inválidos em categorias importantes)
      const { data: alerts } = await supabase
        .from('inspection_items')
        .select(`
          *,
          trucks (nome),
          categories (name)
        `)
        .eq('status', 'invalid')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (alerts) {
        setCriticalAlerts(alerts);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionClick = async (inspection: any) => {
    setSelectedInspection(inspection);
    setLoadingDetails(true);
    try {
      // Buscar todos os itens desta inspeção
      const { data: items, error: itemsError } = await supabase
        .from('inspection_items')
        .select(`
          *,
          categories:category (
            name
          )
        `)
        .eq('inspection_id', inspection.id)
        .order('category');

      if (itemsError) throw itemsError;

      // Agrupar itens por categoria
      const groupedItems = items?.reduce((acc: any, item) => {
        const categoryName = item.categories?.name || 'Sem categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      }, {});

      setInspectionDetails(groupedItems);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedInspection(null);
    setInspectionDetails(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      loadDashboardData();
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">
          Erro ao carregar dados do dashboard: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Vistorias
        </Typography>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={loadDashboardData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Vistorias
              </Typography>
              <Typography variant="h4">
                {stats.totalInspections}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Em Andamento
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Concluídas
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Taxa de Aprovação
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.approvalRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Problemas por Categoria
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="aprovados" fill="#00C49F" name="Aprovados" />
                <Bar dataKey="reprovados" fill="#FF8042" name="Reprovados" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Vistorias ao Longo do Tempo
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                <Line type="monotone" dataKey="concluidas" stroke="#82ca9d" name="Concluídas" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Alertas e Inspeções Recentes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertas Críticos
            </Typography>
            {criticalAlerts.map((alert, index) => (
              <Alert
                key={index}
                severity="warning"
                sx={{ mb: 1 }}
                icon={<WarningIcon />}
              >
                <Typography variant="body2">
                  Veículo: {alert.trucks?.nome} - {alert.categories?.name}
                  <br />
                  Observação: {alert.observation || 'Sem observação'}
                </Typography>
              </Alert>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inspeções Recentes
            </Typography>
            {recentInspections.map((inspection, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: 1
                  },
                  p: 1
                }}
                onClick={() => handleInspectionClick(inspection)}
              >
                {inspection.status === 'concluida' ? (
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                ) : (
                  <PendingIcon color="warning" sx={{ mr: 1 }} />
                )}
                <Box>
                  <Typography variant="body1">
                    {inspection.trucks?.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(inspection.inspection_date), "dd 'de' MMMM 'às' HH:mm", { locale: dateFnsPtBR })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de Detalhes da Vistoria */}
      <Dialog
        open={!!selectedInspection}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedInspection?.status === 'concluida' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <PendingIcon color="warning" />
            )}
            <Typography variant="h6">
              Vistoria - {selectedInspection?.trucks?.nome}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {selectedInspection && format(
              new Date(selectedInspection.inspection_date),
              "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
              { locale: dateFnsPtBR }
            )}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {inspectionDetails && Object.entries(inspectionDetails).map(([category, items]: [string, any]) => (
                <Box key={category} mb={3}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {category}
                  </Typography>
                  <List>
                    {items.map((item: any, index: number) => (
                      <Box key={index}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                {item.status === 'valid' ? (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                ) : (
                                  <WarningIcon color="warning" fontSize="small" />
                                )}
                                <Typography>{item.title}</Typography>
                              </Box>
                            }
                            secondary={item.observation || 'Sem observações'}
                          />
                        </ListItem>
                        {index < items.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Box>
              ))}
              {selectedInspection?.status === 'em_andamento' && (
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/checklist-form/${selectedInspection.truck_id}`)}
                  >
                    Continuar Vistoria
                  </Button>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InspectionDashboard; 