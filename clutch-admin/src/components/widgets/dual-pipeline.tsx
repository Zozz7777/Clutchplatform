'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from '@hello-pangea/dnd';
import { 
  Store, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { productionApi } from '@/lib/production-api';
import { toast } from 'sonner';

interface PipelineDeal {
  id: string;
  title: string;
  companyName: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  value: number;
  probability: number;
  stage: string;
  pipeline: 'partners' | 'b2b';
  type: string;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  deals: PipelineDeal[];
  color: string;
  totalValue: number;
}

interface PipelineData {
  partners: PipelineStage[];
  b2b: PipelineStage[];
}

const PARTNERS_STAGES = [
  { id: 'prospect', name: 'prospect', color: 'bg-primary/10 text-primary' },
  { id: 'contacted', name: 'contacted', color: 'bg-warning/10 text-warning' },
  { id: 'qualified', name: 'qualified', color: 'bg-primary/10 text-primary' },
  { id: 'proposal', name: 'proposal', color: 'bg-info/10 text-info' },
  { id: 'negotiation', name: 'negotiation', color: 'bg-destructive/10 text-destructive' },
  { id: 'signed', name: 'signed', color: 'bg-success/10 text-success' }
];

const B2B_STAGES = [
  { id: 'prospect', name: 'prospect', color: 'bg-primary/10 text-primary' },
  { id: 'discovery', name: 'discovery', color: 'bg-primary/10 text-primary' },
  { id: 'proposal', name: 'proposal', color: 'bg-primary/10 text-primary' },
  { id: 'negotiation', name: 'negotiation', color: 'bg-info/10 text-info' },
  { id: 'contract', name: 'contract', color: 'bg-destructive/10 text-destructive' },
  { id: 'closed_won', name: 'closed_won', color: 'bg-success/10 text-success' }
];

export default function DualPipeline() {
  const { t } = useLanguage();
  const [activePipeline, setActivePipeline] = useState<'partners' | 'b2b'>('partners');
  const [pipelineData, setPipelineData] = useState<PipelineData>({
    partners: [],
    b2b: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setIsLoading(true);
      
      // Load deals data
      const dealsResponse = await productionApi.getDeals();
      if (dealsResponse.success) {
        const deals = dealsResponse.deals || [];
        
        // Separate deals by pipeline
        const partnersDeals = deals.filter((deal: any) => deal.pipeline === 'partners');
        const b2bDeals = deals.filter((deal: any) => deal.pipeline === 'b2b');
        
        // Organize by stages
        const partnersStages = PARTNERS_STAGES.map(stage => ({
          ...stage,
          deals: partnersDeals.filter((deal: any) => deal.stage === stage.id),
          totalValue: partnersDeals
            .filter((deal: any) => deal.stage === stage.id)
            .reduce((sum: number, deal: any) => sum + (deal.valueEGP || 0), 0)
        }));
        
        const b2bStages = B2B_STAGES.map(stage => ({
          ...stage,
          deals: b2bDeals.filter((deal: any) => deal.stage === stage.id),
          totalValue: b2bDeals
            .filter((deal: any) => deal.stage === stage.id)
            .reduce((sum: number, deal: any) => sum + (deal.valueEGP || 0), 0)
        }));
        
        setPipelineData({
          partners: partnersStages,
          b2b: b2bStages
        });
      }
      
      toast.success(t('sales.pipelineDataLoaded'));
    } catch (error) {
      toast.error(t('sales.failedToLoadPipelineData'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const pipeline = activePipeline;
    const stages = pipelineData[pipeline];
    const sourceStage = stages.find(stage => stage.id === source.droppableId);
    const destStage = stages.find(stage => stage.id === destination.droppableId);
    
    if (!sourceStage || !destStage) return;

    const deal = sourceStage.deals.find(d => d.id === draggableId);
    if (!deal) return;

    // Update local state immediately for better UX
    const newStages = stages.map(stage => {
      if (stage.id === source.droppableId) {
        return {
          ...stage,
          deals: stage.deals.filter(d => d.id !== draggableId),
          totalValue: stage.deals
            .filter(d => d.id !== draggableId)
            .reduce((sum, d) => sum + d.value, 0)
        };
      }
      if (stage.id === destination.droppableId) {
        const newDeal = { ...deal, stage: destination.droppableId };
        const newDeals = [...stage.deals];
        newDeals.splice(destination.index, 0, newDeal);
        return {
          ...stage,
          deals: newDeals,
          totalValue: newDeals.reduce((sum, d) => sum + d.value, 0)
        };
      }
      return stage;
    });

    setPipelineData(prev => ({
      ...prev,
      [pipeline]: newStages
    }));

    // Update backend
    try {
      const response = await productionApi.updateDeal(deal.id, {
        stage: destination.droppableId
      });
      
      if (!response.success) {
        // Revert on error
        loadPipelineData();
        toast.error(t('sales.failedToUpdateDeal'));
      } else {
        toast.success(t('sales.dealUpdatedSuccessfully'));
      }
    } catch (error) {
      // Revert on error
      loadPipelineData();
      toast.error(t('sales.failedToUpdateDeal'));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-info/10 text-info';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shop': return '🏪';
      case 'repair_center': return '🔧';
      case 'accessories_store': return '🛍️';
      case 'parts_importer': return '📦';
      case 'manufacturer': return '🏭';
      case 'fleet_company': return '🚚';
      case 'insurance_company': return '🛡️';
      case 'installment_company': return '💳';
      default: return '🏢';
    }
  };

  const currentStages = activePipeline === 'partners' ? pipelineData.partners : pipelineData.b2b;
  const totalValue = currentStages.reduce((sum, stage) => sum + stage.totalValue, 0);
  const totalDeals = currentStages.reduce((sum, stage) => sum + stage.deals.length, 0);

  if (isLoading) {
    return (
      <Card className="shadow-2xs rounded-[0.625rem] font-sans">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('sales.dualPipeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs rounded-[0.625rem] font-sans">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t('sales.dualPipeline')}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {totalDeals} {t('sales.deals')} • EGP {totalValue.toLocaleString()}
            </div>
            <Button size="sm" className="shadow-2xs">
              <Plus className="h-4 w-4 mr-2" />
              {t('sales.newDeal')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activePipeline} onValueChange={(value: 'partners' | 'b2b') => setActivePipeline(value)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              {t('sales.partnersPipeline')}
            </TabsTrigger>
            <TabsTrigger value="b2b" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('sales.b2bPipeline')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activePipeline} className="space-y-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {currentStages.map((stage) => (
                  <div key={stage.id} className="flex-shrink-0 w-80">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {t(`sales.${stage.name}`)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {stage.deals.length} {t('sales.deals')} • EGP {stage.totalValue.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={stage.color}>
                          {stage.deals.length}
                        </Badge>
                      </div>

                      <Droppable droppableId={stage.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[200px] space-y-3 ${
                              snapshot.isDraggingOver ? 'bg-primary/10' : ''
                            }`}
                          >
                            {stage.deals.map((deal, index) => (
                              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`bg-background border rounded-lg p-3 shadow-sm cursor-move ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                          {getTypeIcon(deal.type)}
                                        </span>
                                        <div>
                                          <h4 className="font-medium text-sm text-foreground">
                                            {deal.title}
                                          </h4>
                                          <p className="text-xs text-muted-foreground">
                                            {deal.companyName}
                                          </p>
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Eye className="mr-2 h-3 w-3" />
                                            {t('sales.view')}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Edit className="mr-2 h-3 w-3" />
                                            {t('common.edit')}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Phone className="mr-2 h-3 w-3" />
                                            {t('sales.call')}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Mail className="mr-2 h-3 w-3" />
                                            {t('sales.email')}
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                          {t('sales.value')}
                                        </span>
                                        <span className="font-semibold text-sm">
                                          EGP {deal.value.toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                          {t('sales.probability')}
                                        </span>
                                        <span className="text-sm">
                                          {deal.probability}%
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                          {t('sales.assignedTo')}
                                        </span>
                                        <span className="text-xs">
                                          {deal.assignedTo}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <Badge className={getPriorityColor(deal.priority)}>
                                          {t(`sales.${deal.priority}`)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(deal.lastActivity).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
