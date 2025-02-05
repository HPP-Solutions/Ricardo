import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR as dateFnsPtBR } from 'date-fns/locale';
import supabase from '../helper/supabaseClient';
import { SelectChangeEvent } from '@mui/material/Select';

interface InspectionStatus {
  conforme: number;
  nao_conforme: number;
  parcialmente_conforme: number;
}

const InspectionDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [inspections, setInspections] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [truckFilter, setTruckFilter] = useState('all');
  const [trucks, setTrucks] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7'); // '7', '15', '30' dias
  const [inspectionTrends, setInspectionTrends] = useState<any[]>([]);
  const [selectedTruckStats, setSelectedTruckStats] = useState<any>(null);

  const loadInspectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todas as vistorias com informações do caminhão
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections')
        .select(`
          *,
          trucks (
            id,
            nome
          ),
          inspection_items (
            id,
            status,
            category
          )
        `)
        .order('inspection_date', { ascending: false });

      if (inspectionsError) throw inspectionsError;

      // Buscar lista de caminhões para o filtro
      const { data: trucksData } = await supabase
        .from('trucks')
        .select('*')
        .order('nome');

      if (inspectionsData) {
        setInspections(inspectionsData);
        processInspectionTrends(inspectionsData);
      }

      if (trucksData) {
        setTrucks(trucksData);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processInspectionTrends = (inspectionsData: any[]) => {
    const days = parseInt(timeRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    // Filtrar inspeções dentro do intervalo
    const recentInspections = inspectionsData.filter(inspection => {
      const inspectionDate = new Date(inspection.inspection_date);
      return isWithinInterval(inspectionDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      });
    });

    // Agrupar por data
    const trendsData = recentInspections.reduce((acc: any, inspection) => {
      const date = format(new Date(inspection.inspection_date), 'dd/MM');
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          conforme: 0,
          nao_conforme: 0,
          parcialmente_conforme: 0
        };
      }
      acc[date].total++;
      acc[date][inspection.status]++;
      return acc;
    }, {});

    setInspectionTrends(Object.values(trendsData));
  };

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    processInspectionTrends(inspections);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const calculateTruckStats = (truckId: string) => {
    const truckInspections = inspections.filter(i => i.truck_id.toString() === truckId);
    const totalInspections = truckInspections.length;
    
    const stats = {
      total: totalInspections,
      conformidade: {
        conforme: 0,
        nao_conforme: 0,
        parcialmente_conforme: 0
      } as InspectionStatus,
      categorias: {} as any
    };

    truckInspections.forEach(inspection => {
      stats.conformidade[inspection.status as keyof InspectionStatus]++;
      
      // Análise por categoria
      inspection.inspection_items?.forEach((item: any) => {
        if (!stats.categorias[item.category]) {
          stats.categorias[item.category] = { valid: 0, invalid: 0 };
        }
        stats.categorias[item.category][item.status]++;
      });
    });

    setSelectedTruckStats(stats);
  };

  const handleInspectionClick = async (inspection: any) => {
    setSelectedInspection(inspection);
    setLoadingDetails(true);
    try {
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

      const { data: signature } = await supabase
        .from('signatures')
        .select('signature_data')
        .eq('inspection_id', inspection.id)
        .single();

      if (itemsError) throw itemsError;

      const groupedItems = items?.reduce((acc: any, item) => {
        const categoryName = item.categories?.name || 'Sem categoria';
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conforme':
        return 'success';
      case 'nao_conforme':
        return 'error';
      case 'parcialmente_conforme':
        return 'warning';
      case 'em_andamento':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conforme':
        return <CheckCircleIcon color="success" />;
      case 'nao_conforme':
        return <WarningIcon color="error" />;
      case 'parcialmente_conforme':
        return <WarningIcon color="warning" />;
      case 'em_andamento':
        return <PendingIcon color="info" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const handleCloseDetails = () => {
    setSelectedInspection(null);
    setInspectionDetails(null);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
  };

  const handleTruckFilterChange = (event: SelectChangeEvent) => {
    setTruckFilter(event.target.value as string);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/?showLogin=true');
        return;
      }
      loadInspectionData();
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
          Erro ao carregar dados das vistorias: {error}
        </Alert>
      </Box>
    );
  }

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.trucks?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.reference_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    const matchesTruck = truckFilter === 'all' || inspection.truck_id.toString() === truckFilter;
    return matchesSearch && matchesStatus && matchesTruck;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Vistorias Realizadas
        </Typography>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={loadInspectionData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs de Navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="Vistorias" />
          <Tab label="Análise Temporal" />
          <Tab label="Insights por Veículo" />
        </Tabs>
      </Box>

      {selectedTab === 0 && (
        <>
          {/* Cards de Resumo */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e9', height: '100%' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Vistorias Conformes
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'conforme').length}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  nos últimos 30 dias
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#fff3e0', height: '100%' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Parcialmente Conformes
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon color="warning" />
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'parcialmente_conforme').length}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  requerem atenção
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#ffebee', height: '100%' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Não Conformes
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon color="error" />
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'nao_conforme').length}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  ação imediata necessária
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#e3f2fd', height: '100%' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Em Andamento
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <PendingIcon color="info" />
                  <Typography variant="h4">
                    {inspections.filter(i => i.status === 'em_andamento').length}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  vistorias em execução
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filtros em Linha */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Pesquisar por veículo ou código..."
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
              </Grid>
              <Grid item xs={12} md={3}>
                <Select
                  fullWidth
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  size="small"
                >
                  <MenuItem value="all">Todos os Status</MenuItem>
                  <MenuItem value="conforme">Conformes</MenuItem>
                  <MenuItem value="parcialmente_conforme">Parcialmente Conformes</MenuItem>
                  <MenuItem value="nao_conforme">Não Conformes</MenuItem>
                  <MenuItem value="em_andamento">Em Andamento</MenuItem>
                  <MenuItem value="pendente">Pendentes</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={3}>
                <Select
                  fullWidth
                  value={truckFilter}
                  onChange={handleTruckFilterChange}
                  size="small"
                >
                  <MenuItem value="all">Todos os Veículos</MenuItem>
                  {trucks.map(truck => (
                    <MenuItem key={truck.id} value={truck.id.toString()}>
                      {truck.nome}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={loadInspectionData}
                >
                  Atualizar
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Lista de Vistorias com Priorização */}
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Vistorias Prioritárias
            </Typography>
            <Grid container spacing={2}>
              {filteredInspections
                .filter(inspection => inspection.status === 'nao_conforme')
                .map((inspection) => (
                  <Grid item xs={12} md={4} key={inspection.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 6 },
                        borderLeft: '4px solid #f44336'
                      }}
                      onClick={() => handleInspectionClick(inspection)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" component="div" gutterBottom>
                              {inspection.trucks?.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Código: {inspection.reference_code}
                            </Typography>
                            <Typography variant="body2" color="error">
                              Requer atenção imediata
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            {getStatusIcon(inspection.status)}
                            <Typography variant="caption" display="block">
                              {format(new Date(inspection.inspection_date), "dd/MM/yyyy")}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {format(new Date(inspection.inspection_date), "HH:mm")}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>

          {/* Lista de Vistorias Regular */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Todas as Vistorias
            </Typography>
            <Grid container spacing={2}>
              {filteredInspections
                .filter(inspection => inspection.status !== 'nao_conforme')
                .map((inspection) => (
                  <Grid item xs={12} md={4} key={inspection.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 6 },
                        borderLeft: `4px solid ${
                          inspection.status === 'conforme' ? '#4caf50' :
                          inspection.status === 'parcialmente_conforme' ? '#ff9800' :
                          '#2196f3'
                        }`
                      }}
                      onClick={() => handleInspectionClick(inspection)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6" component="div" gutterBottom>
                              {inspection.trucks?.nome}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Código: {inspection.reference_code}
                            </Typography>
                            <Chip 
                              label={inspection.status.replace('_', ' ')}
                              color={getStatusColor(inspection.status)}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                          <Box textAlign="right">
                            {getStatusIcon(inspection.status)}
                            <Typography variant="caption" display="block">
                              {format(new Date(inspection.inspection_date), "dd/MM/yyyy")}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {format(new Date(inspection.inspection_date), "HH:mm")}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </>
      )}

      {selectedTab === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Tendências de Vistorias</Typography>
              <Select
                size="small"
                value={timeRange}
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="7">Últimos 7 dias</MenuItem>
                <MenuItem value="15">Últimos 15 dias</MenuItem>
                <MenuItem value="30">Últimos 30 dias</MenuItem>
              </Select>
            </Box>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inspectionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="conforme" stroke="#4caf50" name="Conformes" />
                  <Line type="monotone" dataKey="nao_conforme" stroke="#f44336" name="Não Conformes" />
                  <Line type="monotone" dataKey="parcialmente_conforme" stroke="#ff9800" name="Parcialmente Conformes" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Distribuição de Status
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: 'Conformes', value: inspectionTrends.reduce((acc, day) => acc + day.conforme, 0) },
                          { name: 'Não Conformes', value: inspectionTrends.reduce((acc, day) => acc + day.nao_conforme, 0) },
                          { name: 'Parcialmente Conformes', value: inspectionTrends.reduce((acc, day) => acc + day.parcialmente_conforme, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                      >
                        {['#4caf50', '#f44336', '#ff9800'].map((color, index) => (
                          <Cell key={index} fill={color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Volume Diário de Vistorias
                  </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="total" fill="#2196f3" name="Total de Vistorias" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {selectedTab === 2 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selecione um Veículo para Análise Detalhada
            </Typography>
            <Select
              fullWidth
              value={truckFilter}
              onChange={(e) => {
                handleTruckFilterChange(e);
                calculateTruckStats(e.target.value);
              }}
              size="small"
            >
              <MenuItem value="all">Todos os Veículos</MenuItem>
              {trucks.map(truck => (
                <MenuItem key={truck.id} value={truck.id.toString()}>
                  {truck.nome}
                </MenuItem>
              ))}
            </Select>
          </Paper>

          {selectedTruckStats && truckFilter !== 'all' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Histórico de Conformidade
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={[
                            { name: 'Conformes', value: selectedTruckStats.conformidade.conforme },
                            { name: 'Não Conformes', value: selectedTruckStats.conformidade.nao_conforme },
                            { name: 'Parcialmente Conformes', value: selectedTruckStats.conformidade.parcialmente_conforme }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                        >
                          {['#4caf50', '#f44336', '#ff9800'].map((color, index) => (
                            <Cell key={index} fill={color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Análise por Categoria
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(selectedTruckStats.categorias).map(([category, stats]: [string, any]) => ({
                          category,
                          validos: stats.valid,
                          invalidos: stats.invalid
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="validos" fill="#4caf50" name="Itens Válidos" />
                        <Bar dataKey="invalidos" fill="#f44336" name="Itens Inválidos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Diálogo de Detalhes da Vistoria */}
      <Dialog
        open={!!selectedInspection}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(selectedInspection?.status)}
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
                <Chip 
                  label={inspectionDetails?.status.replace('_', ' ')}
                  color={getStatusColor(inspectionDetails?.status)}
                  size="small"
                />
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
                                {item.observation && (
                                  <Typography variant="body2" color="textSecondary">
                                    Observação: {item.observation}
                                  </Typography>
                                )}
                                {item.photos && item.photos.length > 0 && (
                                  <Box mt={1}>
                                    <Typography variant="caption">Fotos ({item.photos.length}):</Typography>
                                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                      {item.photos.map((photo: string, photoIndex: number) => (
                                        <img 
                                          key={photoIndex}
                                          src={photo} 
                                          alt={`Foto ${photoIndex + 1}`}
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
                        filter: 'invert(1)'
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