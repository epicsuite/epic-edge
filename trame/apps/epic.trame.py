from trame.app import get_server
from trame.ui.vuetify import SinglePageWithDrawerLayout
from trame.widgets import vtk, vuetify

from vtk.util import numpy_support
from vtkmodules.vtkFiltersGeneral import vtkTableToPolyData
from vtkmodules.vtkIOInfovis import vtkDelimitedTextReader
from vtkmodules.vtkFiltersSources import vtkSphereSource
from vtkmodules.vtkInteractionWidgets import vtkScalarBarWidget
from vtkmodules.vtkFiltersCore import (
    vtkGlyph3D,
)
from vtkmodules.vtkCommonDataModel import (
    vtkDataObject,
    vtkPointData,
    vtkPolyData,
    vtkCellArray,
)
from vtkmodules.vtkCommonCore import vtkPoints
from vtkmodules.vtkRenderingCore import (
    vtkActor,
    vtkPolyDataMapper,
    vtkGlyph3DMapper,
    vtkRenderer,
    vtkRenderWindow, vtkRenderWindowInteractor,
)
from vtkmodules.vtkRenderingAnnotation import (
    vtkScalarBarActor,
    vtkCubeAxesActor
)
# Required for interactor initialization
from vtkmodules.vtkInteractionStyle import vtkInteractorStyleSwitch  # noqa

# Required for rendering initialization, not necessary for
# local rendering, but doesn't hurt to include it
import vtkmodules.vtkRenderingOpenGL2  # noqa

import sys
import pandas

# reporting
print("---------------------------")
print("Epic Trame application v0.1")
print("---------------------------")

#
# ektStructure 
#
class etkStructure:

    def __init__(self):
        self.ID = 0

    def setScalars(self, variable):
        print(self.pd)
        # print(self.pd.GetOutput().GetPointData())
        self.pd.GetOutput().GetPointData().SetActiveScalars("Untr_peakcounts")

    def load(self, filepath):
        self.reader = vtkDelimitedTextReader()
        self.reader.SetFileName(filepath)
        self.reader.DetectNumericColumnsOn()
        self.reader.SetFieldDelimiterCharacters(',')
        self.reader.SetHaveHeaders(True)

        self.pd = vtkTableToPolyData()
        self.pd.SetInputConnection(self.reader.GetOutputPort())
        self.pd.SetXColumn('x')
        self.pd.SetYColumn('y')
        self.pd.SetZColumn('z')
        self.pd.Update()

        self.pdMapper = vtkPolyDataMapper()
        self.pdMapper.SetInputConnection(self.pd.GetOutputPort())
        self.pdActor = vtkActor()
        self.pdActor.SetMapper(self.pdMapper)

        # create and add the lines
        lines = vtkCellArray()
        for i in range(0, self.pd.GetOutput().GetPoints().GetNumberOfPoints()):
            lines.InsertNextCell(2, [i, i+1])
        self.pd.GetOutput().SetLines(lines)

        # sphere glyphs
        self.sphere = vtkSphereSource()
        self.sphere.SetPhiResolution(10)
        self.sphere.SetThetaResolution(10)
        self.sphere.SetRadius(1.0)
        self.sphere.Update()

        self.spheres = vtkGlyph3D()
        self.spheres.SetInputConnection(self.pd.GetOutputPort())
        self.spheres.SetSourceConnection(self.sphere.GetOutputPort())

        self.sMapper = vtkPolyDataMapper()
        self.sMapper.SetInputConnection(self.spheres.GetOutputPort())
        # self.sMapper.SetScalarModeToUsePointData()
        # self.sMapper.SetArrayName("Untr_Eigenvalues")

        self.sActor = vtkActor()
        self.sActor.SetMapper(self.sMapper)

        self.cActor = vtkCubeAxesActor()
        self.cActor.GetProperty().SetColor(0.5, 0.5, 0.5)

        self.sbActor = vtkScalarBarActor()
        self.sbActor = vtkScalarBarActor()
        self.sbActor.SetPosition(0.25, 0.25)

        fields = [
            (self.pd.GetOutput().GetPointData(), vtkDataObject.FIELD_ASSOCIATION_POINTS)
        ]
        self.dataset_arrays = []
        for field in fields:
            field_arrays, association = field
            for i in range(field_arrays.GetNumberOfArrays()):
                array = field_arrays.GetArray(i)
                array_range = array.GetRange()
                self.dataset_arrays.append(
                    {
                        "text": array.GetName(),
                        "value": i,
                        "range": list(array_range),
                        "type": association,
                    }
                )

        # set color
        # array = self.dataset_arrays[0]
        # print(array.get("range"))
        # _min, _max = array.get("range") 
        # mapper = self.sMapper
        # mapper.SelectColorArray(array.get("text"))
        # mapper.GetLookupTable().SetRange(_min, _max)
        # mapper.GetLookupTable().SetSaturationRange(0, 1)
        # mapper.GetLookupTable().SetValueRange(0, 1)
        # mapper.GetLookupTable().SetNumberOfColors(256)
        # mapper.GetLookupTable().SetHueRange(0.0, 1.0)
        # mapper.GetLookupTable().Build()
        # self.sMapper.SetScalarModeToUsePointFieldData()
        # mapper.SetScalarVisibility(True)
        # mapper.SetUseLookupTableScalarRange(True)
        self.sActor.GetProperty().SetColor(0.3, 0.3, 0.3)



    def AddToRenderer(self, renderer):
        renderer.AddActor(self.sActor)
        renderer.AddActor(self.pdActor)
        renderer.AddActor(self.cActor)
        renderer.AddActor(self.sbActor)
        self.cActor.SetBounds(self.sActor.GetBounds())
        self.cActor.SetCamera(renderer.GetActiveCamera())
        self.cActor.SetFlyModeToOuterEdges()

        self.sbWidget = vtkScalarBarWidget()
        self.sbWidget.SetInteractor(renderer.GetRenderWindow().GetInteractor())
        self.sbWidget.SetScalarBarActor(self.sbActor)
        self.sbWidget.On()

    def load_track(self, filepath, colname):
        df = pandas.read_csv(filepath)
        # print(df)
        rows = df.loc[df['Chrom'].isin(['chr27'])]
        print(rows)
        array = rows[colname]
        print(array)
        values = array.to_numpy()
        print(values)

        varray = numpy_support.numpy_to_vtk(values)
        print(varray)
        # self.pd.GetPointData().AddArray(varray)

# -----------------------------------------------------------------------------
# VTK pipeline
# -----------------------------------------------------------------------------

renderer = vtkRenderer()
renderer.SetBackground(0.5, 0.5, 0.5)
renderWindow = vtkRenderWindow()
renderWindow.AddRenderer(renderer)

renderWindowInteractor = vtkRenderWindowInteractor()
renderWindowInteractor.SetRenderWindow(renderWindow)
renderWindowInteractor.GetInteractorStyle().SetCurrentStyleToTrackballCamera()

struct = etkStructure()
# struct.load("eda-fduh0l8m/structure.csv")
struct.load(sys.argv[1])
# struct.setScalars("Untr_Eigenvalues")
# struct.load_track(sys.argv[2], sys.argv[3])
struct.AddToRenderer(renderer)


renderer.ResetCamera()





# -----------------------------------------------------------------------------
# Trame
# -----------------------------------------------------------------------------

server = get_server(client_type = "vue2")
ctrl = server.controller

with SinglePageWithDrawerLayout(server) as layout:
    layout.title.set_text("Hello trame")

    with layout.content:
        with vuetify.VContainer(
            fluid=True,
            classes="pa-0 fill-height",
        ):
            view = vtk.VtkLocalView(renderWindow)


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    server.start()
