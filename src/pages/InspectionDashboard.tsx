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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
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
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import supabase from '../helper/supabaseClient';
import { SelectChangeEvent } from '@mui/material/Select';

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
    conformes: 0,
    naoConformes: 0,
    parcialmenteConformes: 0,
    pendentes: 0,
    emAndamento: 0,
    conformidadeRate: 0,
  });
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

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
      const conformes = inspections?.filter(i => i.status === 'conforme').length || 0;
      const naoConformes = inspections?.filter(i => i.status === 'nao_conforme').length || 0;
      const parcialmenteConformes = inspections?.filter(i => i.status === 'parcialmente_conforme').length || 0;
      const pendentes = inspections?.filter(i => i.status === 'pendente').length || 0;
      const emAndamento = inspections?.filter(i => i.status === 'em_andamento').length || 0;
      
      // Taxa de conformidade (considerando parcialmente conformes como meio ponto)
      const conformidadeRate = totalInspections > 0 ? 
        ((conformes + (parcialmenteConformes * 0.5)) / totalInspections) * 100 : 0;

      setStats({
        totalInspections,
        conformes,
        naoConformes,
        parcialmenteConformes,
        pendentes,
        emAndamento,
        conformidadeRate,
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
      const { data: allInspections } = await supabase
        .from('inspections')
        .select(`
          *,
          trucks (nome)
        `)
        .order('inspection_date', { ascending: false });

      if (allInspections) {
        setRecentInspections(allInspections);
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
      // Buscar todos os itens com suas respectivas fotos
      const { data: items, error: itemsError } = await supabase
        .from('inspection_items')
        .select(`
          *,
          categories:category (
            name
          ),
          inspection_item_photos (
            id,
            photo_url
          )
        `)
        .eq('inspection_id', inspection.id)
        .order('category');

      // Buscar assinatura
      const { data: signature } = await supabase
        .from('signatures')
        .select('signature_data')
        .eq('inspection_id', inspection.id)
        .single();

      if (itemsError) throw itemsError;

      // Agrupar itens por categoria e incluir fotos
      const groupedItems = items?.reduce((acc: any, item) => {
        const categoryName = item.categories?.name || 'Sem categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        // Adicionar o array de fotos ao item
        const itemWithPhotos = {
          ...item,
          photos: item.inspection_item_photos?.map((photo: any) => photo.photo_url) || []
        };
        acc[categoryName].push(itemWithPhotos);
        return acc;
      }, {});

      setInspectionDetails({
        items: groupedItems,
        signature: signature?.signature_data,
        referenceCode: inspection.reference_code,
        status: inspection.status,
        inspectionDate: inspection.inspection_date
      });

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

  const handleFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/?showLogin=true');
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
        <Grid item xs={12} sm={6} md={2}>
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
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conformes
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.conformes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Parcialmente Conformes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.parcialmenteConformes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Não Conformes
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.naoConformes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Em Andamento
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.emAndamento}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h4" color="text.secondary">
                {stats.pendentes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
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
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Status das Vistorias
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Conformes', value: stats.conformes },
                    { name: 'Parcialmente Conformes', value: stats.parcialmenteConformes },
                    { name: 'Não Conformes', value: stats.naoConformes },
                    { name: 'Em Andamento', value: stats.emAndamento },
                    { name: 'Pendentes', value: stats.pendentes }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#666666'].map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom>
                Todas as Inspeções
              </Typography>
              <Box display="flex" gap={2}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Pesquisar veículo..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={statusFilter}
                  onChange={handleFilterChange}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  <MenuItem value="conforme">Conformes</MenuItem>
                  <MenuItem value="parcialmente_conforme">Parcialmente Conformes</MenuItem>
                  <MenuItem value="nao_conforme">Não Conformes</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="pendente">Pendentes</MenuItem>
                </Select>
              </Box>
            </Box>
            {recentInspections
              .filter(inspection => 
                inspection.trucks?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (statusFilter === 'all' || inspection.status === statusFilter)
              )
              .map((inspection, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
                    p: 1
                  }}
                  onClick={() => handleInspectionClick(inspection)}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {inspection.status === 'conforme' ? (
                      <CheckCircleIcon color="success" />
                    ) : inspection.status === 'nao_conforme' ? (
                      <WarningIcon color="error" />
                    ) : inspection.status === 'parcialmente_conforme' ? (
                      <WarningIcon color="warning" />
                    ) : inspection.status === 'em_andamento' ? (
                      <PendingIcon color="info" />
                    ) : (
                      <PendingIcon color="disabled" />
                    )}
                    <Box>
                      <Typography variant="body1">
                        {inspection.trucks?.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {inspection.reference_code}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {inspection.inspection_date && 
                      format(new Date(inspection.inspection_date), "dd/MM/yy HH:mm")
                    }
                  </Typography>
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
            {selectedInspection?.status === 'conforme' ? (
              <CheckCircleIcon color="success" />
            ) : selectedInspection?.status === 'nao_conforme' ? (
              <WarningIcon color="error" />
            ) : selectedInspection?.status === 'parcialmente_conforme' ? (
              <WarningIcon color="warning" />
            ) : selectedInspection?.status === 'em_andamento' ? (
              <PendingIcon color="info" />
            ) : (
              <PendingIcon color="disabled" />
            )}
            <Typography variant="h6">
              Vistoria - {selectedInspection?.trucks?.nome}
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary">
            {selectedInspection?.inspection_date && 
              format(
                new Date(selectedInspection.inspection_date),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                { locale: dateFnsPtBR }
              )
            }
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box mb={4}>
                <Typography variant="subtitle1" gutterBottom>
                  Código da Vistoria: {inspectionDetails?.referenceCode}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Status: {inspectionDetails?.status}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Data: {inspectionDetails?.inspectionDate && 
                    format(new Date(inspectionDetails.inspectionDate), "dd/MM/yyyy HH:mm")
                  }
                </Typography>
              </Box>

              {inspectionDetails?.items && Object.entries(inspectionDetails.items).map(([category, items]: [string, any]) => (
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
                            secondary={
                              <Box>
                                {item.observation && <Typography variant="body2">{item.observation}</Typography>}
                                {item.photos && item.photos.length > 0 && (
                                  <Box mt={1}>
                                    <Typography variant="caption">Fotos ({item.photos.length}):</Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                      {item.photos.map((photo: string, photoIndex: number) => (
                                        <img 
                                          key={photoIndex}
                                          src={photo} 
                                          alt={`Foto ${photoIndex + 1} do item ${item.title}`}
                                          style={{ 
                                            width: '100px', 
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                          }}
                                          onClick={() => setExpandedPhoto(photo)}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < items.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Box>
              ))}

              {inspectionDetails?.signature && (
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    Assinatura do Responsável
                  </Typography>
                  <Box 
                    sx={{ 
                      bgcolor: 'white', 
                      p: 2, 
                      borderRadius: 1,
                      boxShadow: 1,
                      maxWidth: '300px'
                    }}
                  >
                    <img 
                      src={inspectionDetails.signature} 
                      alt="Assinatura digital"
                      style={{ 
                        width: '100%',
                        height: 'auto',
                        filter: 'invert(1)' // Para assinaturas em preto
                      }}
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para expandir a foto */}
      <Dialog
        open={!!expandedPhoto}
        onClose={() => setExpandedPhoto(null)}
        maxWidth="lg"
      >
        <DialogContent>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ overflow: 'hidden' }}
          >
            <img
              src={expandedPhoto || ''}
              alt="Foto expandida"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InspectionDashboard; 